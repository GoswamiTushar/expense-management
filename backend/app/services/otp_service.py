import random
from app.services.mailer import send_mail

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def send_verification_otp(to_email: str, otp: str) -> bool:
    print(f"[OTP Service] Verification code for {to_email}: {otp}")
    html = f"""
    <div style="font-family:sans-serif;padding:20px;color:#1e293b;">
      <h2>Verify Your Email</h2>
      <p>Thank you for signing up. Use the verification code below to activate your account:</p>
      <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#FF385C;padding:12px 0;">{otp}</div>
      <p>This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
    """
    ok = send_mail(to_email, f"{otp} is your Airbnb Manager Verification Code", html)
    if ok:
        print(f"[OTP Service] Delivered code {otp} to {to_email}")
    return ok
