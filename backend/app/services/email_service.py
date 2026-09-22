import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

def send_onboarding_email(to_email: str, invite_code: str, property_name: str, inviter_name: str) -> bool:
    if not settings.smtp_user or not settings.smtp_pass:
        print(f"[Email Service MOCK] Invite {invite_code} sent to {to_email} for {property_name} by {inviter_name}")
        return True
    try:
        sender = settings.smtp_from or settings.smtp_user
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Join {property_name} on Airbnb Manager"
        msg["From"] = sender
        msg["To"] = to_email
        html = f"""
        <h3>You have been invited!</h3>
        <p><strong>{inviter_name}</strong> invited you to co-manage <strong>{property_name}</strong>.</p>
        <p>Your Invite Code: <strong>{invite_code}</strong></p>
        <p>Open the app and select 'Join via Invite' to get started!</p>
        """
        msg.attach(MIMEText(html, "html"))
        if settings.smtp_port == 465:
            with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=15) as server:
                server.login(settings.smtp_user, settings.smtp_pass)
                server.sendmail(sender, to_email, msg.as_string())
        else:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_pass)
                server.sendmail(sender, to_email, msg.as_string())
        print(f"[Email Service] Successfully sent invite email to {to_email}")
        return True
    except Exception as e:
        print(f"[Email Service Error] Failed: {e}")
        return False
