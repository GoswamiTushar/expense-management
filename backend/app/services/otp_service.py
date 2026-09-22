import smtplib, random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def send_verification_otp(to_email: str, otp: str) -> bool:
    print(f"[OTP Service] Verification code for {to_email}: {otp}")
    if not settings.smtp_user or not settings.smtp_pass:
        return True
    try:
        sender = settings.smtp_from or settings.smtp_user
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"{otp} is your Airbnb Manager Verification Code"
        msg["From"] = sender
        msg["To"] = to_email
        html = f"""
        <div style="font-family:sans-serif;padding:20px;color:#1e293b;">
          <h2>Verify Your Email</h2>
          <p>Thank you for signing up. Use the verification code below to activate your account:</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#FF385C;padding:12px 0;">{otp}</div>
          <p>This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
        """
        msg.attach(MIMEText(html, "html"))
        if settings.smtp_port == 465:
            with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=5) as s:
                s.login(settings.smtp_user, settings.smtp_pass)
                s.sendmail(sender, to_email, msg.as_string())
        else:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=5) as s:
                s.starttls()
                s.login(settings.smtp_user, settings.smtp_pass)
                s.sendmail(sender, to_email, msg.as_string())
        print(f"[OTP Service] Delivered code {otp} to {to_email}")
        return True
    except Exception as e:
        print(f"[OTP Service Warning] SMTP delivery notice ({e}). Code remains valid: {otp}")
        return False
