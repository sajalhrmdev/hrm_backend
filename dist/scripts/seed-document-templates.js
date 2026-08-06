import { prisma } from "../lib/prisma.js";
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Poppins:wght@300;400;500;600;700&display=swap');`;
const FONTS_GOLD = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&family=Great+Vibes&display=swap');`;
const HEADER = (companyName) => `
  <tr><td style="height:5px;background:linear-gradient(90deg,#b0b0b0,#707070,#b0b0b0);"></td></tr>
  <tr><td style="padding:25px 40px 12px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="width:60px;vertical-align:middle;">
        {{#if companyLogo}}<img src="{{companyLogo}}" style="max-height:55px;max-width:55px;" />{{/if}}
      </td>
      <td style="vertical-align:middle;padding-left:15px;">
        <h1 style="margin:0;font-family:'Marcellus',serif;color:#333;font-size:20px;font-weight:400;">${companyName}</h1>
        <p style="margin:3px 0 0;color:#888;font-size:11px;font-weight:300;letter-spacing:0.5px;">{{companyAddress}}</p>
        <p style="margin:2px 0 0;color:#aaa;font-size:10px;font-weight:300;">{{companyPhone}} | {{companyEmail}}</p>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e0e0e0;margin:0;" /></td></tr>`;
const FOOTER = `
  <tr><td style="height:5px;background:linear-gradient(90deg,#b0b0b0,#707070,#b0b0b0);"></td></tr>`;
const SIGNATURE_BLOCK = `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;">
    <tr>
      <td style="width:40%;text-align:left;vertical-align:bottom;">
        <div style="width:180px;padding-top:8px;border-top:1px solid #555;">
          <p style="margin:4px 0 0;color:#333;font-size:11px;font-weight:500;">Authorized Signatory</p>
          <p style="margin:2px 0 0;color:#999;font-size:9px;">{{companyName}}</p>
        </div>
      </td>
      <td style="width:20%;text-align:center;vertical-align:middle;"></td>
      <td style="width:40%;text-align:right;vertical-align:bottom;">
        <div style="width:180px;margin-left:auto;padding-top:8px;border-top:1px solid #555;">
          <p style="margin:4px 0 0;color:#333;font-size:11px;font-weight:500;">{{todayDate}}</p>
          <p style="margin:2px 0 0;color:#999;font-size:9px;">Date of Issue</p>
        </div>
      </td>
    </tr>
  </table>`;
const LABEL = (text) => `color:#aaa;font-size:9px;text-transform:uppercase;letter-spacing:1.5px;font-weight:400;`;
const VALUE = `color:#333;font-size:12px;font-weight:500;`;
// Content-only templates (NO DOCTYPE/html/head/body)
const templates = [
    {
        name: "Appointment Letter",
        slug: "appointment-letter",
        category: "APPOINTMENT",
        subject: "Appointment Letter - {{employeeName}}",
        description: "Premium appointment letter - A4 portrait",
        htmlContent: `<style>${FONTS}</style>
<table width="794" cellpadding="0" cellspacing="0" style="margin:0 auto;font-family:'Poppins',sans-serif;color:#2d2d2d;">
  ${HEADER("{{companyName}}")}
  <tr><td style="padding:25px 40px 15px;">
    <h2 style="margin:0 0 4px;font-family:'Marcellus',serif;color:#555;font-size:14px;font-weight:400;text-transform:uppercase;letter-spacing:4px;">Appointment Letter</h2>
    <p style="margin:0 0 20px;color:#b0b0b0;font-size:11px;font-weight:300;letter-spacing:1px;">EMPLOYMENT APPOINTMENT</p>
    <p style="margin:0 0 6px;color:#999;font-size:12px;font-weight:300;">Dear</p>
    <div style="margin:0 0 6px;padding-bottom:8px;border-bottom:2px solid #555;display:inline-block;">
      <h3 style="margin:0;font-family:'Marcellus',serif;color:#222;font-size:26px;font-weight:400;">{{employeeName}}</h3>
    </div>
    <p style="font-size:13px;line-height:1.9;color:#555;margin:12px 0 6px;font-weight:300;">
      We are pleased to inform you that you have been appointed as <strong style="color:#333;font-weight:500;">{{designation}}</strong>
      in the <strong style="color:#333;font-weight:500;">{{department}}</strong> department of
      <strong style="color:#333;font-weight:500;">{{companyName}}</strong>, effective from
      <strong style="color:#333;font-weight:500;">{{joiningDate}}</strong>.
    </p>
    <p style="font-size:13px;line-height:1.9;color:#555;margin:0 0 16px;font-weight:300;">
      Your employment shall be governed by the company's terms and conditions. You are requested to report to the HR department on your date of joining with the necessary documents.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td style="padding:8px 0;border-top:1px solid #eee;width:33%;"><p style="margin:0;${LABEL('')}">Employee Code</p><p style="margin:4px 0 0;${VALUE}">{{employeeCode}}</p></td>
        <td style="padding:8px 0;border-top:1px solid #eee;width:33%;"><p style="margin:0;${LABEL('')}">Designation</p><p style="margin:4px 0 0;${VALUE}">{{designation}}</p></td>
        <td style="padding:8px 0;border-top:1px solid #eee;width:33%;"><p style="margin:0;${LABEL('')}">Joining Date</p><p style="margin:4px 0 0;${VALUE}">{{joiningDate}}</p></td>
      </tr>
    </table>
    <p style="font-size:13px;line-height:1.9;color:#555;margin:0;font-weight:300;">We look forward to a long and mutually beneficial association with you.</p>
  </td></tr>
  <tr><td style="padding:0 40px 20px;">${SIGNATURE_BLOCK}</td></tr>
  ${FOOTER}
</table>`,
    },
    {
        name: "Offer Letter",
        slug: "offer-letter",
        category: "OFFER",
        subject: "Offer Letter - {{employeeName}}",
        description: "Royal gold offer letter - A4 portrait, formal letter style",
        htmlContent: `<style>${FONTS_GOLD}</style>
<table width="794" cellpadding="0" cellspacing="0" style="margin:0 auto;font-family:'Poppins',sans-serif;background:#faf7f0;border:5px solid #b17a2d;">
  <tr><td style="padding:22px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #c79a48;">
      <tr><td style="padding:30px 40px;position:relative;">
        <table width="100%" cellpadding="0" cellspacing="0" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;">
          <tr>
            <td style="position:absolute;top:5px;left:8px;font-size:42px;color:#c79a48;line-height:1;">&#10086;</td>
            <td style="position:absolute;top:5px;right:8px;font-size:42px;color:#c79a48;line-height:1;transform:scaleX(-1);">&#10086;</td>
            <td style="position:absolute;bottom:-5px;left:8px;font-size:42px;color:#c79a48;line-height:1;transform:scaleY(-1);">&#10086;</td>
            <td style="position:absolute;bottom:-5px;right:8px;font-size:42px;color:#c79a48;line-height:1;transform:scale(-1);">&#10086;</td>
          </tr>
        </table>

        <!-- Title -->
        <div style="text-align:center;margin-bottom:20px;">
          <span style="font-family:'Great Vibes',cursive;font-size:48px;color:#222;">Job Offer Letter</span>
        </div>

        <!-- Company Header -->
        <div style="text-align:center;margin-bottom:5px;">
          {{#if companyLogo}}<img src="{{companyLogo}}" style="max-height:60px;max-width:60px;" />{{/if}}
          <div style="font-weight:700;font-size:20px;color:#222;margin-top:6px;">{{companyName}}</div>
          <div style="font-size:11px;color:#555;">{{companyAddress}}</div>
          <div style="font-size:11px;color:#555;">{{companyPhone}} | {{companyEmail}}</div>
        </div>

        <hr style="border:none;border-top:1px solid #c79a48;margin:15px 0;" />

        <!-- Date -->
        <div style="text-align:right;margin-bottom:18px;font-size:13px;color:#333;">
          {{todayDate}}
        </div>

        <!-- To -->
        <div style="margin-bottom:18px;">
          <div style="font-size:13px;color:#333;margin-bottom:6px;"><b>To:</b></div>
          <div style="font-size:20px;font-weight:700;color:#222;margin-bottom:4px;">{{employeeName}}</div>
          <div style="font-size:12px;color:#555;">{{address}}</div>
        </div>

        <!-- Salutation -->
        <div style="font-size:13px;color:#333;margin-bottom:14px;">Dear {{employeeName}},</div>

        <!-- Body -->
        <div style="font-size:13px;line-height:1.9;color:#333;">
          <p style="margin:0 0 12px;">
            We are pleased to offer you the position of <b>{{designation}}</b> at <b>{{companyName}}</b>, starting on <b>{{joiningDate}}</b>.
            {{#if department}}In this role, you will be part of the <b>{{department}}</b> department.{{/if}}
          </p>
          {{#if salary}}
          <p style="margin:0 0 12px;">
            Your monthly salary will be <b>{{salary}}</b>, along with benefits including health insurance, paid leave, internet allowance, and performance bonuses. Full details will be shared upon confirmation.
          </p>
          {{/if}}
          <p style="margin:0 0 12px;">
            Please confirm your acceptance by signing and returning this letter.
          </p>
          <p style="margin:0 0 12px;">
            We look forward to having you onboard and seeing your skills and ideas come to life!
          </p>
        </div>

        <!-- Signature -->
        <div style="margin-top:30px;">
          <div style="margin-bottom:6px;font-size:13px;color:#333;">Warm Regards,</div>
          <div style="height:40px;"></div>
          <div style="border-top:2px solid #222;width:200px;padding-top:8px;">
            <b style="font-size:13px;color:#222;">{{companyName}}</b><br/>
            <span style="font-size:11px;color:#555;">Authorized Signatory</span>
          </div>
        </div>

        <!-- Company Footer -->
        <hr style="border:none;border-top:1px solid #c79a48;margin:25px 0 12px;" />
        <div style="text-align:center;font-size:11px;color:#777;line-height:1.8;">
          <span>&#128205; {{companyAddress}}</span><br/>
          <span>&#9742; {{companyPhone}}</span> &nbsp;&nbsp; <span>&#9993; {{companyEmail}}</span>
          {{#if companyWebsite}}<br/><span>{{companyWebsite}}</span>{{/if}}
        </div>

      </td></tr>
    </table>
  </td></tr>
</table>`,
    },
    {
        name: "Internship Certificate",
        slug: "internship-certificate",
        category: "INTERNSHIP",
        subject: "Internship Certificate - {{employeeName}}",
        description: "Royal gold internship certificate - A4 portrait",
        htmlContent: `<style>${FONTS_GOLD}</style>
<table width="794" cellpadding="0" cellspacing="0" style="margin:0 auto;font-family:'Poppins',sans-serif;background:#faf7f0;border:5px solid #b17a2d;">
  <tr><td style="padding:22px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #c79a48;">
      <tr><td style="padding:30px 40px;position:relative;">
        <table width="100%" cellpadding="0" cellspacing="0" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;">
          <tr>
            <td style="position:absolute;top:5px;left:8px;font-size:42px;color:#c79a48;line-height:1;">&#10086;</td>
            <td style="position:absolute;top:5px;right:8px;font-size:42px;color:#c79a48;line-height:1;transform:scaleX(-1);">&#10086;</td>
            <td style="position:absolute;bottom:-5px;left:8px;font-size:42px;color:#c79a48;line-height:1;transform:scaleY(-1);">&#10086;</td>
            <td style="position:absolute;bottom:-5px;right:8px;font-size:42px;color:#c79a48;line-height:1;transform:scale(-1);">&#10086;</td>
          </tr>
        </table>
        <div style="text-align:center;margin-bottom:5px;">
          {{#if companyLogo}}<img src="{{companyLogo}}" style="max-height:60px;max-width:60px;" />{{/if}}
          <div style="font-weight:700;font-size:20px;color:#222;margin-top:6px;">{{companyName}}</div>
          <div style="font-size:11px;color:#555;">{{companyAddress}}</div>
          <div style="font-size:11px;color:#555;">{{companyPhone}} | {{companyEmail}}</div>
        </div>
        <div style="text-align:center;margin:22px 0 10px;">
          <span style="font-family:'Great Vibes',cursive;font-size:52px;color:#222;">Certificate of Internship</span>
        </div>
        <div style="text-align:center;font-size:16px;font-style:italic;color:#444;margin-bottom:8px;">This is to certify that</div>
        <div style="text-align:center;font-size:34px;font-weight:700;letter-spacing:2px;color:#222;margin:10px 0 20px;">{{employeeName}}</div>
        <div style="font-size:13px;line-height:1.8;color:#333;text-align:center;">
          <p style="margin:0 0 10px;">Successfully completed an internship with <b>{{companyName}}</b> as <b>{{designation}}</b> in the <b>{{department}}</b> department from <b>{{joiningDate}}</b>.</p>
          <p style="margin:0 0 10px;">During this internship, the candidate worked under professional guidance and successfully completed the assigned responsibilities with dedication and sincerity.</p>
          <p style="margin:0 0 10px;">The intern demonstrated professionalism, dedication, teamwork, communication skills and a strong willingness to learn throughout the internship.</p>
          <p style="margin:0;">We sincerely appreciate the contribution made during the internship and wish them continued success in all future endeavours.</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;">
          <tr>
            <td style="width:50%;text-align:left;vertical-align:bottom;">
              <div style="height:40px;"></div>
              <div style="width:200px;border-top:2px solid #222;margin-top:8px;padding-top:8px;">
                <b style="font-size:12px;">{{companyName}}</b><br/><span style="font-size:10px;color:#555;">Authorized Signatory</span>
              </div>
            </td>
            <td style="width:50%;text-align:right;vertical-align:bottom;">
              <div style="height:40px;"></div>
              <div style="width:200px;margin-left:auto;border-top:2px solid #222;margin-top:8px;padding-top:8px;">
                <b style="font-size:12px;">{{todayDate}}</b><br/><span style="font-size:10px;color:#555;">Date of Issue</span>
              </div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>`,
    },
    {
        name: "Experience Letter",
        slug: "experience-letter",
        category: "EXPERIENCE",
        subject: "Experience Letter - {{employeeName}}",
        description: "Royal gold experience letter - A4 portrait",
        htmlContent: `<style>${FONTS_GOLD}</style>
<table width="794" cellpadding="0" cellspacing="0" style="margin:0 auto;font-family:'Poppins',sans-serif;background:#faf7f0;border:5px solid #b17a2d;">
  <tr><td style="padding:22px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #c79a48;">
      <tr><td style="padding:30px 40px;position:relative;">
        <table width="100%" cellpadding="0" cellspacing="0" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;">
          <tr>
            <td style="position:absolute;top:5px;left:8px;font-size:42px;color:#c79a48;line-height:1;">&#10086;</td>
            <td style="position:absolute;top:5px;right:8px;font-size:42px;color:#c79a48;line-height:1;transform:scaleX(-1);">&#10086;</td>
            <td style="position:absolute;bottom:-5px;left:8px;font-size:42px;color:#c79a48;line-height:1;transform:scaleY(-1);">&#10086;</td>
            <td style="position:absolute;bottom:-5px;right:8px;font-size:42px;color:#c79a48;line-height:1;transform:scale(-1);">&#10086;</td>
          </tr>
        </table>
        <div style="text-align:center;margin-bottom:5px;">
          {{#if companyLogo}}<img src="{{companyLogo}}" style="max-height:60px;max-width:60px;" />{{/if}}
          <div style="font-weight:700;font-size:20px;color:#222;margin-top:6px;">{{companyName}}</div>
          <div style="font-size:11px;color:#555;">{{companyAddress}}</div>
          <div style="font-size:11px;color:#555;">{{companyPhone}} | {{companyEmail}}</div>
        </div>
        <div style="text-align:center;margin:22px 0 10px;">
          <span style="font-family:'Great Vibes',cursive;font-size:52px;color:#222;">Certificate of Experience</span>
        </div>
        <div style="text-align:center;font-size:16px;font-style:italic;color:#444;margin-bottom:8px;">This is to certify that</div>
        <div style="text-align:center;font-size:34px;font-weight:700;letter-spacing:2px;color:#222;margin:10px 0 20px;">{{employeeName}}</div>
        <div style="font-size:13px;line-height:1.8;color:#333;text-align:center;">
          <p style="margin:0 0 10px;">has been employed with <b>{{companyName}}</b> as <b>{{designation}}</b> in the <b>{{department}}</b> department from <b>{{joiningDate}}</b>.</p>
          <p style="margin:0 0 10px;">During their tenure, the employee has been found to be sincere, hardworking, and dedicated to their duties. Their conduct and character have been excellent throughout their association with us.</p>
          <p style="margin:0 0 10px;">They have successfully completed the assigned responsibilities with professionalism and demonstrated strong teamwork, communication skills and a willingness to learn.</p>
          <p style="margin:0;">We wish them continued success in all their future endeavors.</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;">
          <tr>
            <td style="width:50%;text-align:left;vertical-align:bottom;">
              <div style="height:40px;"></div>
              <div style="width:200px;border-top:2px solid #222;margin-top:8px;padding-top:8px;">
                <b style="font-size:12px;">{{companyName}}</b><br/><span style="font-size:10px;color:#555;">Authorized Signatory</span>
              </div>
            </td>
            <td style="width:50%;text-align:right;vertical-align:bottom;">
              <div style="height:40px;"></div>
              <div style="width:200px;margin-left:auto;border-top:2px solid #222;margin-top:8px;padding-top:8px;">
                <b style="font-size:12px;">{{todayDate}}</b><br/><span style="font-size:10px;color:#555;">Date of Issue</span>
              </div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>`,
    },
    {
        name: "Relieving Letter",
        slug: "relieving-letter",
        category: "RELIEVING",
        subject: "Relieving Letter - {{employeeName}}",
        description: "Premium relieving letter - A4 portrait",
        htmlContent: `<style>${FONTS}</style>
<table width="794" cellpadding="0" cellspacing="0" style="margin:0 auto;font-family:'Poppins',sans-serif;color:#2d2d2d;">
  ${HEADER("{{companyName}}")}
  <tr><td style="padding:25px 40px 15px;">
    <h2 style="margin:0 0 4px;font-family:'Marcellus',serif;color:#555;font-size:14px;font-weight:400;text-transform:uppercase;letter-spacing:4px;">Relieving Letter</h2>
    <p style="margin:0 0 20px;color:#b0b0b0;font-size:11px;font-weight:300;letter-spacing:1px;">RELIEF FROM DUTIES</p>
    <p style="margin:0 0 8px;color:#999;font-size:12px;font-weight:300;">To Whom It May Concern,</p>
    <p style="font-size:13px;line-height:1.9;color:#555;margin:0 0 6px;font-weight:300;">
      This is to certify that <strong style="color:#333;font-weight:500;">{{employeeName}}</strong> ({{employeeCode}})
      was employed with <strong style="color:#333;font-weight:500;">{{companyName}}</strong> as
      <strong style="color:#333;font-weight:500;">{{designation}}</strong> in the
      <strong style="color:#333;font-weight:500;">{{department}}</strong> department.
    </p>
    <p style="font-size:13px;line-height:1.9;color:#555;margin:0 0 6px;font-weight:300;">
      We confirm that {{employeeName}} has been relieved of all their duties and responsibilities effective from
      <strong style="color:#333;font-weight:500;">{{joiningDate}}</strong>. All company dues have been settled
      and all company property has been returned.
    </p>
    <p style="font-size:13px;line-height:1.9;color:#555;margin:0 0 16px;font-weight:300;">
      We have no objection to {{employeeName}} seeking employment elsewhere and wish them the very best in their future career.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td style="padding:8px 0;border-top:1px solid #eee;width:33%;"><p style="margin:0;${LABEL('')}">Employee Code</p><p style="margin:4px 0 0;${VALUE}">{{employeeCode}}</p></td>
        <td style="padding:8px 0;border-top:1px solid #eee;width:33%;"><p style="margin:0;${LABEL('')}">Designation</p><p style="margin:4px 0 0;${VALUE}">{{designation}}</p></td>
        <td style="padding:8px 0;border-top:1px solid #eee;width:33%;"><p style="margin:0;${LABEL('')}">Relieving Date</p><p style="margin:4px 0 0;${VALUE}">{{joiningDate}}</p></td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:0 40px 20px;">${SIGNATURE_BLOCK}</td></tr>
  ${FOOTER}
</table>`,
    },
    {
        name: "Salary Slip",
        slug: "salary-slip",
        category: "SALARY_SLIP",
        subject: "Salary Slip - {{employeeName}}",
        description: "Premium salary slip - A4 portrait",
        htmlContent: `<style>${FONTS}</style>
<table width="794" cellpadding="0" cellspacing="0" style="margin:0 auto;font-family:'Poppins',sans-serif;color:#2d2d2d;">
  ${HEADER("{{companyName}}")}
  <tr><td style="padding:25px 40px 15px;">
    <h2 style="margin:0 0 4px;font-family:'Marcellus',serif;color:#555;font-size:14px;font-weight:400;text-transform:uppercase;letter-spacing:4px;">Salary Slip</h2>
    <p style="margin:0 0 18px;color:#b0b0b0;font-size:11px;font-weight:300;letter-spacing:1px;">MONTHLY COMPENSATION</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:8px 0;border-top:1px solid #eee;width:25%;"><p style="margin:0;${LABEL('')}">Employee Name</p><p style="margin:4px 0 0;${VALUE}">{{employeeName}}</p></td>
        <td style="padding:8px 0;border-top:1px solid #eee;width:25%;"><p style="margin:0;${LABEL('')}">Employee Code</p><p style="margin:4px 0 0;${VALUE}">{{employeeCode}}</p></td>
        <td style="padding:8px 0;border-top:1px solid #eee;width:25%;"><p style="margin:0;${LABEL('')}">Department</p><p style="margin:4px 0 0;${VALUE}">{{department}}</p></td>
        <td style="padding:8px 0;border-top:1px solid #eee;width:25%;"><p style="margin:0;${LABEL('')}">Designation</p><p style="margin:4px 0 0;${VALUE}">{{designation}}</p></td>
      </tr>
    </table>
    <hr style="border:none;border-top:1px solid #e0e0e0;margin:0 0 16px;" />
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:top;width:48%;padding-right:15px;">
        <p style="margin:0 0 8px;color:#555;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:1.5px;">Earnings</p>
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size:12px;border:1px solid #eee;">
          <tr style="background:#f7f7f7;"><td style="font-weight:500;color:#555;">Component</td><td style="font-weight:500;color:#555;text-align:right;">Amount</td></tr>
          {{#each earnings}}
          <tr><td style="border-top:1px solid #f0f0f0;">{{this.name}}</td><td style="border-top:1px solid #f0f0f0;text-align:right;">&#8377;{{this.amount}}</td></tr>
          {{/each}}
          <tr style="background:#f0f8f0;font-weight:600;"><td style="border-top:1px solid #ddd;">Total Earnings</td><td style="border-top:1px solid #ddd;text-align:right;">&#8377;{{totalEarnings}}</td></tr>
        </table>
      </td>
      <td style="vertical-align:top;width:48%;padding-left:15px;">
        <p style="margin:0 0 8px;color:#555;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:1.5px;">Deductions</p>
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size:12px;border:1px solid #eee;">
          <tr style="background:#f7f7f7;"><td style="font-weight:500;color:#555;">Component</td><td style="font-weight:500;color:#555;text-align:right;">Amount</td></tr>
          {{#each deductions}}
          <tr><td style="border-top:1px solid #f0f0f0;">{{this.name}}</td><td style="border-top:1px solid #f0f0f0;text-align:right;">&#8377;{{this.amount}}</td></tr>
          {{/each}}
          <tr style="background:#fff0f0;font-weight:600;"><td style="border-top:1px solid #ddd;">Total Deductions</td><td style="border-top:1px solid #ddd;text-align:right;">&#8377;{{totalDeductions}}</td></tr>
        </table>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:0 40px 20px;">${SIGNATURE_BLOCK}</td></tr>
  ${FOOTER}
</table>`,
    },
];
const seed = async () => {
    const argId = process.argv[2] ? process.argv[2].trim() : undefined;
    let companyIds;
    if (argId && argId !== "all") {
        companyIds = [parseInt(argId, 10)];
    }
    else {
        const all = await prisma.company.findMany({ select: { id: true } });
        if (!all.length) {
            console.log("No companies found.");
            await prisma.$disconnect();
            return;
        }
        companyIds = all.map((c) => c.id);
    }
    console.log(`\nSeeding document templates for ${companyIds.length} company(ies): ${companyIds.join(", ")}\n`);
    for (const companyId of companyIds) {
        console.log(`--- Company ${companyId} ---`);
        for (const tpl of templates) {
            try {
                const existing = await prisma.documentTemplate.findFirst({ where: { companyId, slug: tpl.slug } });
                if (existing) {
                    await prisma.documentTemplate.update({ where: { id: existing.id }, data: { name: tpl.name, subject: tpl.subject, htmlContent: tpl.htmlContent, description: tpl.description, category: tpl.category } });
                    console.log(`  Updated: ${tpl.name}`);
                }
                else {
                    await prisma.documentTemplate.create({ data: { companyId, name: tpl.name, slug: tpl.slug, category: tpl.category, subject: tpl.subject, htmlContent: tpl.htmlContent, description: tpl.description, isActive: true } });
                    console.log(`  Created: ${tpl.name}`);
                }
            }
            catch (err) {
                console.log(`  Failed: ${tpl.name} - ${err.message}`);
            }
        }
    }
    console.log(`\nDone! ${templates.length} document templates seeded for ${companyIds.length} company(ies).\n`);
    await prisma.$disconnect();
};
seed();
