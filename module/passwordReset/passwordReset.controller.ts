import { Request, Response } from "express";
import {
  requestPasswordOtp,
  requestPasswordOtpForUser,
  verifyPasswordOtp,
  resetPasswordWithToken,
} from "./passwordReset.service.js";

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    await requestPasswordOtp(req.body?.email || "");
    return res.json({
      success: true,
      message: "If an account exists for this email, an OTP has been sent.",
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const forgotPasswordMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any)?.user?.userId;
    if (!userId) throw new Error("Not authenticated");
    const data = await requestPasswordOtpForUser(Number(userId));
    return res.json({
      success: true,
      data,
      message: "OTP sent to your account email.",
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const data = await verifyPasswordOtp(req.body?.email || "", req.body?.otp || "");
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    await resetPasswordWithToken(
      req.body?.email || "",
      req.body?.resetToken || "",
      req.body?.newPassword || "",
    );
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
