def render_otp_email(otp: str, to_email: str = "") -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:24px 12px;background:#0F121A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#181C28;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4);border:1px solid #273046;" cellspacing="0" cellpadding="0">
        <tr>
          <td style="background:linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%);padding:28px 24px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Ledger</h1>
            <p style="color:rgba(255,255,255,0.9);margin:6px 0 0 0;font-size:13px;font-weight:500;">Account Security Verification</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 28px;">
            <p style="font-size:15px;color:#F1F5F9;margin:0 0 12px 0;line-height:22px;">Hello,</p>
            <p style="font-size:15px;color:#94A3B8;margin:0 0 24px 0;line-height:22px;">Thank you for signing up. Use the verification code below to activate your account:</p>
            <div style="background:#0F121A;border:2px dashed #334155;border-radius:14px;padding:20px;text-align:center;margin:0 0 20px 0;">
              <div style="font-size:11px;font-weight:800;letter-spacing:1px;color:#64748B;margin-bottom:6px;">6-DIGIT VERIFICATION CODE</div>
              <span style="font-family:'SF Mono',Consolas,monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#38BDF8;display:inline-block;">{otp}</span>
            </div>
            <p style="font-size:13px;color:#64748B;margin:0 0 6px 0;line-height:20px;">⏱️ This code expires in <strong>10 minutes</strong>.</p>
            <p style="font-size:12px;color:#475569;margin:0;line-height:18px;">If you did not request this verification, please ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#131722;padding:16px 24px;text-align:center;border-top:1px solid #273046;">
            <p style="margin:0;color:#64748B;font-size:12px;">© 2026 Ledger • Split • Track • Settle</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def render_password_reset_email(otp: str, to_email: str = "") -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:24px 12px;background:#0F121A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#181C28;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4);border:1px solid #273046;" cellspacing="0" cellpadding="0">
        <tr>
          <td style="background:linear-gradient(135deg, #F43F5E 0%, #881337 100%);padding:28px 24px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Ledger</h1>
            <p style="color:rgba(255,255,255,0.9);margin:6px 0 0 0;font-size:13px;font-weight:500;">Password Reset Request</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 28px;">
            <p style="font-size:15px;color:#F1F5F9;margin:0 0 12px 0;line-height:22px;">Hello,</p>
            <p style="font-size:15px;color:#94A3B8;margin:0 0 24px 0;line-height:22px;">We received a request to reset your Ledger account password. Enter this 6-digit confirmation code in the app to choose a new password:</p>
            <div style="background:#0F121A;border:2px dashed #475569;border-radius:14px;padding:20px;text-align:center;margin:0 0 20px 0;">
              <div style="font-size:11px;font-weight:800;letter-spacing:1px;color:#94A3B8;margin-bottom:6px;">PASSWORD RESET CODE</div>
              <span style="font-family:'SF Mono',Consolas,monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#FB7185;display:inline-block;">{otp}</span>
            </div>
            <p style="font-size:13px;color:#94A3B8;margin:0 0 6px 0;line-height:20px;">⏱️ This security code is valid for <strong>10 minutes</strong>.</p>
            <p style="font-size:12px;color:#64748B;margin:0;line-height:18px;">If you did not request a password reset, please disregard this email — your existing password remains safe and unchanged.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#131722;padding:16px 24px;text-align:center;border-top:1px solid #273046;">
            <p style="margin:0;color:#64748B;font-size:12px;">© 2026 Ledger • Automated Security Service</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""

