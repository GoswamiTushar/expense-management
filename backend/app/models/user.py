from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    upiId: Optional[str] = ""

class UserLogin(BaseModel):
    email: str  # Can be email or username "admin"
    password: str

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOtpRequest(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyResetOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    newPassword: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    upiId: Optional[str] = ""
    initials: str
    color: str
    role: Optional[str] = "user"

