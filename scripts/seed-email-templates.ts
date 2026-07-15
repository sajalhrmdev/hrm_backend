import { prisma } from "../lib/prisma.js";

// ====================================================
// EMAIL TEMPLATE SEEDER
// Run: npx tsx scripts/seed-email-templates.ts
// ====================================================

const templates = [
  // 1. WELCOME EMAIL
  {
    name: "Welcome Email",
    slug: "welcome",
    subject: "Welcome to {{companyName}}, {{employeeName}}!",
    description: "Sent when a new employee is onboarded",
    htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 30px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Welcome to {{companyName}}!</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">We're excited to have you on the team</p>
  </td></tr>
  <tr><td style="padding:30px;">
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">Hi <strong>{{employeeName}}</strong>,</p>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">Welcome aboard! Your employee account has been created and you're all set to get started.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin:20px 0;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Your Details</p>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.8;">
          <strong>Employee Code:</strong> {{employeeCode}}<br>
          <strong>Email:</strong> {{employeeEmail}}<br>
          <strong>Company:</strong> {{companyName}}
        </p>
      </td></tr>
    </table>
    <p style="margin:20px 0;color:#374151;font-size:15px;line-height:1.6;">Click the button below to log in and explore your dashboard:</p>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="{{loginUrl}}" style="display:inline-block;background-color:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600;">Login to Dashboard</a>
    </td></tr></table>
    <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;line-height:1.6;">If you have any questions, reach out to your HR team or reply to this email.</p>
  </td></tr>
  <tr><td style="background-color:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">{{companyName}} &bull; HR Management System</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  },

  // 2. LEAVE REQUEST NOTIFICATION (to Manager/Admin)
  {
    name: "Leave Request Notification",
    slug: "leave-request",
    subject: "{{employeeName}} has requested {{leaveType}} leave",
    description: "Sent to manager/admin when employee applies for leave",
    htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <tr><td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:30px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">📋 New Leave Request</h1>
  </td></tr>
  <tr><td style="padding:30px;">
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">A new leave request has been submitted and requires your approval.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border-radius:8px;border:1px solid #fde68a;margin:20px 0;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 12px;color:#92400e;font-size:13px;font-weight:600;">Leave Details</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;line-height:2;">
          <tr><td style="color:#6b7280;width:130px;"><strong>Employee</strong></td><td>{{employeeName}} ({{employeeCode}})</td></tr>
          <tr><td style="color:#6b7280;"><strong>Leave Type</strong></td><td>{{leaveType}}</td></tr>
          <tr><td style="color:#6b7280;"><strong>From</strong></td><td>{{fromDate}}</td></tr>
          <tr><td style="color:#6b7280;"><strong>To</strong></td><td>{{toDate}}</td></tr>
          <tr><td style="color:#6b7280;"><strong>Total Days</strong></td><td>{{totalDays}}</td></tr>
          <tr><td style="color:#6b7280;"><strong>Reason</strong></td><td>{{leaveReason}}</td></tr>
        </table>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="{{loginUrl}}" style="display:inline-block;background-color:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600;">Review & Approve</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="background-color:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">{{companyName}} &bull; HR Management System</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  },

  // 3. LEAVE APPROVED
  {
    name: "Leave Approved",
    slug: "leave-approved",
    subject: "Your {{leaveType}} request has been approved ✅",
    description: "Sent to employee when their leave is approved",
    htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <tr><td style="background:linear-gradient(135deg,#10b981,#059669);padding:30px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">✅ Leave Approved</h1>
  </td></tr>
  <tr><td style="padding:30px;">
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">Hi <strong>{{employeeName}}</strong>,</p>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">Great news! Your leave request has been <strong style="color:#059669;">approved</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ecfdf5;border-radius:8px;border:1px solid #a7f3d0;margin:20px 0;">
      <tr><td style="padding:16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;line-height:2;">
          <tr><td style="color:#6b7280;width:120px;"><strong>Leave Type</strong></td><td>{{leaveType}}</td></tr>
          <tr><td style="color:#6b7280;"><strong>From</strong></td><td>{{fromDate}}</td></tr>
          <tr><td style="color:#6b7280;"><strong>To</strong></td><td>{{toDate}}</td></tr>
          <tr><td style="color:#6b7280;"><strong>Total Days</strong></td><td>{{totalDays}}</td></tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:20px 0 0;color:#6b7280;font-size:13px;">Enjoy your time off! 🎉</p>
  </td></tr>
  <tr><td style="background-color:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">{{companyName}} &bull; HR Management System</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  },

  // 4. LEAVE REJECTED
  {
    name: "Leave Rejected",
    slug: "leave-rejected",
    subject: "Your {{leaveType}} request has been declined",
    description: "Sent to employee when their leave is rejected",
    htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <tr><td style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:30px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">❌ Leave Not Approved</h1>
  </td></tr>
  <tr><td style="padding:30px;">
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">Hi <strong>{{employeeName}}</strong>,</p>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">We regret to inform you that your leave request has not been approved at this time.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border-radius:8px;border:1px solid #fecaca;margin:20px 0;">
      <tr><td style="padding:16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;line-height:2;">
          <tr><td style="color:#6b7280;width:120px;"><strong>Leave Type</strong></td><td>{{leaveType}}</td></tr>
          <tr><td style="color:#6b7280;"><strong>From</strong></td><td>{{fromDate}}</td></tr>
          <tr><td style="color:#6b7280;"><strong>To</strong></td><td>{{toDate}}</td></tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:20px 0 0;color:#6b7280;font-size:13px;">If you have questions, please contact your manager or HR team.</p>
  </td></tr>
  <tr><td style="background-color:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">{{companyName}} &bull; HR Management System</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  },

  // 5. PASSWORD RESET
  {
    name: "Password Reset",
    slug: "password-reset",
    subject: "Reset your {{companyName}} password",
    description: "Sent when employee requests a password reset",
    htmlContent: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <tr><td style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:30px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">🔒 Password Reset</h1>
  </td></tr>
  <tr><td style="padding:30px;">
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">Hi <strong>{{employeeName}}</strong>,</p>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">We received a request to reset your password. Click the button below to set a new password:</p>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px 0;">
      <a href="{{loginUrl}}" style="display:inline-block;background-color:#3b82f6;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600;">Reset Password</a>
    </td></tr></table>
    <p style="margin:16px 0 0;color:#9ca3af;font-size:13px;line-height:1.6;">This link will expire in 30 minutes. If you didn't request this, please ignore this email.</p>
  </td></tr>
  <tr><td style="background-color:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">{{companyName}} &bull; HR Management System</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  },
];

const seed = async () => {
  const argId = process.argv[2] ? parseInt(process.argv[2], 10) : undefined;
  let companyId: number;

  if (argId) {
    companyId = argId;
  } else {
    const first = await prisma.company.findFirst({ select: { id: true } });
    if (!first) { console.log("❌ No companies found."); await prisma.$disconnect(); return; }
    companyId = first.id;
  }

  console.log(`\n📧 Seeding email templates for companyId: ${companyId}\n`);

  for (const tpl of templates) {
    try {
      const existing = await prisma.emailTemplate.findFirst({
        where: { companyId, slug: tpl.slug },
      });

      if (existing) {
        await prisma.emailTemplate.update({
          where: { id: existing.id },
          data: {
            name: tpl.name,
            subject: tpl.subject,
            htmlContent: tpl.htmlContent,
            description: tpl.description,
          },
        });
        console.log(`  ✅ Updated: ${tpl.name} (slug: ${tpl.slug})`);
      } else {
        await prisma.emailTemplate.create({
          data: {
            companyId,
            name: tpl.name,
            slug: tpl.slug,
            subject: tpl.subject,
            htmlContent: tpl.htmlContent,
            description: tpl.description,
            isActive: true,
          },
        });
        console.log(`  ✅ Created: ${tpl.name} (slug: ${tpl.slug})`);
      }
    } catch (err: any) {
      console.log(`  ❌ Failed: ${tpl.name} — ${err.message}`);
    }
  }

  console.log(`\n🎉 Done! ${templates.length} email templates seeded.\n`);
  await prisma.$disconnect();
};

seed();
