from pydantic import BaseModel, EmailStr

# Schema for incoming Sign Up request data
class SignUpRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

# Schema for incoming Login request data
class LoginRequest(BaseModel):
    email: str
    password: str

# Schema for returning user details (excluding password)
class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    model_config = {
        "from_attributes": True
    }

# Schema for standard message responses
class MessageResponse(BaseModel):
    message: str
