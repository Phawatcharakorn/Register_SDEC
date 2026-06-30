import { Resend } from 'resend'

// ส่งอีเมลยืนยันการรับใบสมัคร
// ถ้าไม่มี RESEND_API_KEY → ข้ามไปเงียบๆ ไม่ให้ fail request
export async function sendConfirmationEmail(opts: {
  to:          string
  fullName:    string
  studentId:   string
  referenceId: string
  submittedAt: string   // ISO string
}) {
  if (!process.env.RESEND_API_KEY) return

  const dateStr = new Date(opts.submittedAt).toLocaleDateString('th-TH', {
    year:   'numeric',
    month:  'long',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  })

  const statusUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://register-sdec.vercel.app'}/status?q=${opts.referenceId}`

  const html = /* html */`
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ยืนยันการรับใบสมัคร SDEC</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1565C0,#1E88E5);padding:32px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7);">
              มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา
            </p>
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">
              ศูนย์พัฒนานิสิตสู่ความเป็นเลิศ
            </h1>
            <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">
              Student Development and Excellence Center
            </p>
          </td>
        </tr>

        <!-- Gold line -->
        <tr><td style="height:3px;background:linear-gradient(90deg,transparent,#FFD700,#FFC107,#FFD700,transparent);"></td></tr>

        <!-- Content -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <!-- Check icon -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding-bottom:24px;">
                <div style="display:inline-block;background:#D1FAE5;border-radius:50%;padding:16px;">
                  <div style="background:#10B981;border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
                    <span style="color:#fff;font-size:28px;line-height:1;">✓</span>
                  </div>
                </div>
              </td></tr>
            </table>

            <h2 style="margin:0 0 8px;text-align:center;font-size:20px;font-weight:700;color:#111827;">
              ได้รับใบสมัครของคุณแล้ว!
            </h2>
            <p style="margin:0 0 24px;text-align:center;font-size:14px;color:#6B7280;">
              สวัสดี <strong style="color:#111827;">${opts.fullName}</strong> ระบบได้รับใบสมัครเรียบร้อยแล้ว
            </p>

            <!-- Info box -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid #F3F4F6;">
                        <span style="font-size:12px;color:#9CA3AF;">ชื่อผู้สมัคร</span><br>
                        <strong style="font-size:14px;color:#111827;">${opts.fullName}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid #F3F4F6;">
                        <span style="font-size:12px;color:#9CA3AF;">รหัสนิสิต</span><br>
                        <strong style="font-size:14px;color:#111827;">${opts.studentId}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid #F3F4F6;">
                        <span style="font-size:12px;color:#9CA3AF;">วันที่สมัคร</span><br>
                        <strong style="font-size:14px;color:#111827;">${dateStr}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;">
                        <span style="font-size:12px;color:#9CA3AF;">เลขที่ใบสมัคร</span><br>
                        <strong style="font-size:12px;color:#111827;font-family:monospace;">${opts.referenceId}</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Next steps -->
            <h3 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#374151;">ขั้นตอนถัดไป</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              ${[
                ['🔍', 'ทีมงาน SDEC จะพิจารณาใบสมัครภายใน 7 วันทำการ'],
                ['📧', 'คุณจะได้รับอีเมลแจ้งผลการคัดเลือกที่อีเมลนี้'],
                ['📋', 'สามารถติดตามสถานะได้ที่ลิงก์ด้านล่าง'],
              ].map(([icon, text]) => `
              <tr>
                <td style="padding:6px 0;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:28px;vertical-align:top;font-size:14px;">${icon}</td>
                      <td style="font-size:13px;color:#4B5563;line-height:1.5;">${text}</td>
                    </tr>
                  </table>
                </td>
              </tr>`).join('')}
            </table>

            <!-- CTA button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${statusUrl}"
                  style="display:inline-block;background:#1565C0;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 32px;border-radius:10px;">
                  ตรวจสอบสถานะการสมัคร →
                </a>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F9FAFB;border-top:1px solid #E5E7EB;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#9CA3AF;">
              อีเมลนี้ส่งโดยอัตโนมัติจากระบบสมัคร SDEC<br>
              © ${new Date().getFullYear()} มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from:    'SDEC <noreply@register-sdec.vercel.app>',
      to:      [opts.to],
      subject: `[SDEC] ยืนยันการรับใบสมัคร — ${opts.fullName}`,
      html,
    })
  } catch (e) {
    // Email failure is non-fatal — log and continue
    console.warn('[email] confirmation send failed:', e)
  }
}
