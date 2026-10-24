import secrets
from app.services.mailer import send_mail
from app.templates.otp_email import render_otp_email, render_password_reset_email

def generate_otp() -> str:
    return str(secrets.SystemRandom().randint(100000, 999999))

def send_verification_otp(to_email: str, otp: str) -> bool:
    print(f"[OTP Service] Dispatching verification code to {to_email}")
    html = render_otp_email(otp, to_email)
    ok = send_mail(to_email, f"{otp} is your verification code", html)
    if ok:
        print(f"[OTP Service] Successfully dispatched verification email to {to_email}")
    return ok

def send_password_reset_otp(to_email: str, otp: str) -> bool:
    print(f"[OTP Service] Dispatching password reset code to {to_email}")
    html = render_password_reset_email(otp, to_email)
    ok = send_mail(to_email, f"{otp} is your Ledger password reset code", html)
    if ok:
        print(f"[OTP Service] Successfully dispatched password reset email to {to_email}")
    return ok

