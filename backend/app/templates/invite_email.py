def render_invite_email(inviter: str, prop: str, code: str) -> str:
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
            <p style="color:rgba(255,255,255,0.9);margin:6px 0 0 0;font-size:13px;font-weight:500;">Co-Management Invitation</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 28px;">
            <p style="font-size:15px;color:#334155;margin:0 0 12px 0;line-height:22px;">Hello,</p>
            <p style="font-size:15px;color:#334155;margin:0 0 20px 0;line-height:22px;"><strong>{inviter}</strong> has invited you to co-manage <strong>{prop}</strong> on Airbnb Property Hub.</p>
            <div style="background:#F8FAFC;border:2px dashed #CBD5E1;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px 0;">
              <div style="font-size:11px;font-weight:800;letter-spacing:1px;color:#64748B;margin-bottom:6px;">PARTNER INVITE CODE</div>
              <span style="font-family:'SF Mono',Consolas,monospace;font-size:28px;font-weight:800;letter-spacing:4px;color:#FF385C;display:inline-block;">{code}</span>
            </div>
            <p style="font-size:13px;color:#64748B;margin:0 0 20px 0;line-height:20px;">Open the app and select <strong>"Join with invite code"</strong> on your dashboard to join this property.</p>
            <div style="text-align:center;margin:24px 0 8px 0;">
              <a href="https://backend-sigma-fawn-53.vercel.app" style="background:#FF385C;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;display:inline-block;">Open Airbnb Property Hub</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#F8FAFC;padding:16px 24px;text-align:center;border-top:1px solid #E2E8F0;">
            <p style="margin:0;color:#94A3B8;font-size:12px;">© 2026 Airbnb Property Hub • Expense & Property Management</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
