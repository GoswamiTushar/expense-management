import time, random

COLORS = ["#FF385C", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"]

def create_user_doc(name: str, email: str, password: str = "", upi_id: str = ""):
    initials = "".join([n[0] for n in name.strip().split(" ")])[:2].upper()
    return {
        "_id": f"user_{int(time.time()*1000)}_{random.randint(100, 999)}",
        "name": name.strip(), "email": email.strip().lower(), "password": password,
        "upiId": upi_id.strip(), "initials": initials, "color": random.choice(COLORS),
        "isVerified": True,
    }
