from app.services.mailer import send_mail

def send_onboarding_email(to_email: str, invite_code: str, property_name: str, inviter_name: str) -> bool:
    html = f"""
    <h3>You have been invited!</h3>
    <p><strong>{inviter_name}</strong> invited you to co-manage <strong>{property_name}</strong>.</p>
    <p>Your Invite Code: <strong>{invite_code}</strong></p>
    <p>Open the app, sign in or sign up, and select 'Join via Code' on your dashboard to join!</p>
    """
    ok = send_mail(to_email, f"Join {property_name} on Airbnb Manager", html)
    if ok:
        print(f"[Email Service] Successfully sent invite email to {to_email}")
    return ok
