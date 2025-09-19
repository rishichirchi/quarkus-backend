from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from services.email_service import EmailService
import uvicorn

app = FastAPI(title="Email Service", version="1.0.0")
email_service = EmailService()

class VerificationEmailRequest(BaseModel):
    email: EmailStr
    name: str
    token: str

class PasswordResetEmailRequest(BaseModel):
    email: EmailStr
    name: str
    token: str

@app.post("/send-verification")
async def send_verification_email(request: VerificationEmailRequest):
    result = await email_service.send_verification_email(
        request.email, 
        request.name, 
        request.token
    )
    
    if result["status"] == "sent":
        return {"message": "Verification email sent successfully", "result": result}
    else:
        raise HTTPException(status_code=500, detail=result["message"])

@app.post("/send-password-reset")
async def send_password_reset_email(request: PasswordResetEmailRequest):
    result = await email_service.send_password_reset_email(
        request.email,
        request.name, 
        request.token
    )
    
    if result["status"] == "sent":
        return {"message": "Password reset email sent successfully", "result": result}
    else:
        raise HTTPException(status_code=500, detail=result["message"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "email-service"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8081)