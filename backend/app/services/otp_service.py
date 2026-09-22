import secrets
from app.services.mailer import send_mail
from app.templates.otp_email import render_otp_email

def generate_otp() -> str:
    return str(secrets.SystemRandom().randint(100000, 999999))

def send_verification_otp(to_email: str, otp: str) -> bool:
    print(f"[OTP Service] Verification code for {to_email}: {otp}")
    html = render_otp_email(otp)
    ok = send_mail(to_email, f"{otp} is your verification code", html)
    if ok:
        print(f"[OTP Service] Delivered code {otp} to {to_email}")
    return ok
