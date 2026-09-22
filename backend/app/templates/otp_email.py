def render_otp_email(otp: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:24px 12px;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #E2E8F0;" cellspacing="0" cellpadding="0">
        <tr>
          <td style="background:linear-gradient(135deg, #FF385C 0%, #E00B41 100%);padding:28px 24px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Airbnb Property Hub</h1>
            <p style="color:rgba(255,255,255,0.9);margin:6px 0 0 0;font-size:13px;font-weight:500;">Account Security Verification</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 28px;">
            <p style="font-size:15px;color:#334155;margin:0 0 12px 0;line-height:22px;">Hello,</p>
            <p style="font-size:15px;color:#334155;margin:0 0 24px 0;line-height:22px;">Thank you for signing up. Use the verification code below to activate your manager account:</p>
            <div style="background:#F8FAFC;border:2px dashed #CBD5E1;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px 0;">
              <div style="font-size:11px;font-weight:800;letter-spacing:1px;color:#64748B;margin-bottom:6px;">6-DIGIT VERIFICATION CODE</div>
              <span style="font-family:'SF Mono',Consolas,monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#FF385C;display:inline-block;">{otp}</span>
            </div>
            <p style="font-size:13px;color:#64748B;margin:0 0 6px 0;line-height:20px;">⏱️ This code expires in <strong>10 minutes</strong>.</p>
            <p style="font-size:12px;color:#94A3B8;margin:0;line-height:18px;">If you did not request this verification, please ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#F8FAFC;padding:16px 24px;text-align:center;border-top:1px solid #E2E8F0;">
            <p style="margin:0;color:#94A3B8;font-size:12px;">© 2026 Airbnb Property Hub • Automated Security</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
