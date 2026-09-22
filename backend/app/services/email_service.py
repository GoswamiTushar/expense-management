from app.services.mailer import send_mail
from app.templates.invite_email import render_invite_email

def send_onboarding_email(to_email: str, invite_code: str, property_name: str, inviter_name: str, inviter_email: str = "") -> bool:
    html = render_invite_email(inviter_name, property_name, invite_code)
    cc = [inviter_email.strip().lower()] if inviter_email and inviter_email.strip().lower() != to_email.strip().lower() else None
    ok = send_mail(to_email, f"Invitation to co-manage {property_name}", html, cc=cc)
    if ok:
        print(f"[Email Service] Successfully sent invite email to {to_email} (CC: {cc})")
    return ok
