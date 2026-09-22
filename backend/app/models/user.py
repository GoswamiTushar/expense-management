from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    upiId: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOtpRequest(BaseModel):
    email: EmailStr

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    upiId: Optional[str] = ""
    initials: str
    color: str
