import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import {
  safeSendEmailBySlug,
  EMAIL_LOGIN_URL,
} from "../../services/email.service.js";

const OTP_EXPIRY_MIN = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_MAX_REQ_PER_HOUR = 3;
const RESET_TOKEN_EXPIRY_MIN = 10;

const sha256 = (s: string) =>
  crypto.createHash("sha256").update(s).digest("hex");

const genOtp = () => String(Math.floor(100000 + Math.random() * 900000));

type OtpUser = {
  email: string;
  name: string | null;
  memberships: { companyId: number }[];
};

const checkRateLimit = async (email: string) => {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.passwordResetOtp.count({
    where: { email, createdAt: { gte: hourAgo } },
  });
  if (recent >= OTP_MAX_REQ_PER_HOUR) {
    throw new Error("Too many requests. Please try again later.");
  }
};

// shared core: invalidate old + create OTP + send mail
// sendTo = address OTP goes to (may be employee profile email,
// while login account is resolved separately)
const issueOtpForUser = async (
  user: OtpUser,
  sendTo?: string,
) => {
  const norm = (sendTo || user.email).trim().toLowerCase();

  await checkRateLimit(norm);

  // invalidate previous unused OTPs
  await prisma.passwordResetOtp.updateMany({
    where: { email: norm, used: false },
    data: { used: true },
  });

  const otp = genOtp();
  await prisma.passwordResetOtp.create({
    data: {
      email: norm,
      otpHash: sha256(otp),
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MIN * 60 * 1000),
    },
  });

  // resolve SMTP via user's first active company
  const companyId = user.memberships[0]?.companyId;
  if (!companyId) {
    throw new Error(
      "No active company found for this account. Please contact admin.",
    );
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true },
  });

  const ok = await safeSendEmailBySlug({
    companyId,
    to: norm,
    slug: "password-reset",
    variables: {
      employeeName: user.name || norm,
      otp,
      expiryMinutes: String(OTP_EXPIRY_MIN),
      companyName: company?.name || "",
      loginUrl: EMAIL_LOGIN_URL,
    },
  });

  if (!ok) {
    throw new Error("Could not send OTP email. Please contact admin.");
  }

  return { sent: true, email: norm };
};

// ======================================================
// 1) REQUEST OTP
// ======================================================

export const requestPasswordOtp = async (email: string) => {
  const norm = email.trim().toLowerCase();

  if (!norm) throw new Error("Email is required");

  // rate limit (counts every request, even unknown emails)
  await checkRateLimit(norm);

  let user = await prisma.user.findUnique({
    where: { email: norm },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        select: { companyId: true },
      },
    },
  });

  // fallback: employee profile email may differ from login email —
  // resolve via linked login account
  if (!user) {
    const emp = await prisma.employee.findFirst({
      where: { email: norm },
      select: { userId: true },
    });
    if (emp?.userId) {
      user = await prisma.user.findUnique({
        where: { id: emp.userId },
        include: {
          memberships: {
            where: { status: "ACTIVE" },
            select: { companyId: true },
          },
        },
      });
    }
  }

  // generic reply — never reveal whether the email exists
  if (!user) return { sent: false };

  return issueOtpForUser(user, norm);
};

// ======================================================
// 1b) REQUEST OTP FOR LOGGED-IN USER (by userId)
// ======================================================

export const requestPasswordOtpForUser = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        select: { companyId: true },
      },
    },
  });

  if (!user) throw new Error("User not found");

  return issueOtpForUser(user);
};

// ======================================================
// 2) VERIFY OTP -> single-use reset token
// ======================================================

export const verifyPasswordOtp = async (email: string, otp: string) => {
  const norm = email.trim().toLowerCase();

  const rec = await prisma.passwordResetOtp.findFirst({
    where: { email: norm, used: false },
    orderBy: { createdAt: "desc" },
  });

  if (!rec) {
    throw new Error("Invalid or expired OTP. Please request a new one.");
  }

  if (rec.expiresAt < new Date()) {
    throw new Error("OTP expired. Please request a new one.");
  }

  if (rec.attempts >= OTP_MAX_ATTEMPTS) {
    throw new Error("Too many wrong attempts. Please request a new OTP.");
  }

  if (sha256(otp.trim()) !== rec.otpHash) {
    await prisma.passwordResetOtp.update({
      where: { id: rec.id },
      data: { attempts: { increment: 1 } },
    });
    throw new Error("Incorrect OTP.");
  }

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetOtp.update({
    where: { id: rec.id },
    data: {
      verified: true,
      resetTokenHash: sha256(token),
      resetExpiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MIN * 60 * 1000),
    },
  });

  return { resetToken: token };
};

// ======================================================
// 3) RESET PASSWORD
// ======================================================

export const resetPasswordWithToken = async (
  email: string,
  resetToken: string,
  newPassword: string,
) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const norm = email.trim().toLowerCase();

  const rec = await prisma.passwordResetOtp.findFirst({
    where: { email: norm, used: false, verified: true },
    orderBy: { createdAt: "desc" },
  });

  if (
    !rec ||
    !rec.resetTokenHash ||
    !rec.resetExpiresAt ||
    rec.resetExpiresAt < new Date()
  ) {
    throw new Error("Invalid or expired reset session. Please start again.");
  }

  if (sha256(resetToken) !== rec.resetTokenHash) {
    throw new Error("Invalid reset session. Please start again.");
  }

  const user = await prisma.user.findUnique({ where: { email: norm } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(newPassword, 10) },
  });

  await prisma.passwordResetOtp.updateMany({
    where: { email: norm, used: false },
    data: { used: true },
  });

  return { ok: true };
};
