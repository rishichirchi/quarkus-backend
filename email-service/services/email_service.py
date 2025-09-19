import logging
from datetime import datetime
from typing import Optional

try:
    import sib_api_v3_sdk
    from sib_api_v3_sdk.rest import ApiException
    BREVO_AVAILABLE = True
except ImportError:
    BREVO_AVAILABLE = False
    
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        logger.info(f"Initializing EmailService...")
        logger.info(f"BREVO_AVAILABLE: {BREVO_AVAILABLE}")
        logger.info(f"BREVO_API_KEY configured: {'Yes' if settings.BREVO_API_KEY else 'No'}")
        logger.info(f"BREVO_SENDER_EMAIL: {settings.BREVO_SENDER_EMAIL}")
        logger.info(f"BREVO_SENDER_NAME: {settings.BREVO_SENDER_NAME}")
        
        if BREVO_AVAILABLE and settings.BREVO_API_KEY:
            configuration = sib_api_v3_sdk.Configuration()
            configuration.api_key['api-key'] = settings.BREVO_API_KEY
            self.email_api = sib_api_v3_sdk.TransactionalEmailsApi(
                sib_api_v3_sdk.ApiClient(configuration)
            )
            logger.info("Brevo Email API initialized successfully")
        else:
            self.email_api = None
            logger.warning("Brevo Email API not available")
    
    async def send_verification_email(
        self, 
        recipient_email: str,
        recipient_name: str,
        verification_token: str
    ) -> dict:
        """Send email verification email"""
        
        logger.info(f"Attempting to send verification email to: {recipient_email}")
        
        if not self.email_api:
            logger.error("Email service not configured - no API client available")
            return {"status": "failed", "message": "Email service not configured"}
        
        try:
            verification_link = f"{settings.VERIFICATION_URL}?token={verification_token}"
            logger.info(f"Verification link: {verification_link}")
            
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                        <h2 style="color: #333;">Welcome to AuthService!</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hi {recipient_name},</p>
                        <p>Thank you for signing up! Please verify your email address to activate your account.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{verification_link}" 
                               style="background-color: #007bff; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                Verify Email Address
                            </a>
                        </div>
                        
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #666;">{verification_link}</p>
                        
                        <p style="color: #666; font-size: 14px; margin-top: 30px;">
                            This verification link will expire in 24 hours.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": recipient_email, "name": recipient_name}],
                sender={
                    "email": settings.BREVO_SENDER_EMAIL,
                    "name": settings.BREVO_SENDER_NAME
                },
                subject="Verify Your Email Address",
                html_content=html_content
            )
            
            logger.info(f"Sending email via Brevo API...")
            response = self.email_api.send_transac_email(send_smtp_email)
            logger.info(f"Email sent successfully! Message ID: {response.message_id}")
            
            return {
                "status": "sent",
                "message_id": response.message_id,
                "sent_at": datetime.now().isoformat()
            }
            
        except ApiException as e:
            logger.error(f"Failed to send verification email: {e}")
            logger.error(f"API Exception details: {e.body}")
            return {
                "status": "failed",
                "error": str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error sending verification email: {e}")
            return {
                "status": "failed",
                "error": str(e)
            }
    
    async def send_password_reset_email(
        self,
        recipient_email: str,
        recipient_name: str,
        reset_token: str
    ) -> dict:
        """Send password reset email"""
        
        if not self.email_api:
            return {"status": "failed", "message": "Email service not configured"}
        
        try:
            reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
            
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                        <h2 style="color: #333;">Password Reset Request</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hi {recipient_name},</p>
                        <p>You requested a password reset for your account. Click the button below to set a new password:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{reset_link}" 
                               style="background-color: #dc3545; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #666;">{reset_link}</p>
                        
                        <p style="color: #666; font-size: 14px; margin-top: 30px;">
                            This reset link will expire in 1 hour. If you didn't request this, please ignore this email.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": recipient_email, "name": recipient_name}],
                sender={
                    "email": settings.BREVO_SENDER_EMAIL,
                    "name": settings.BREVO_SENDER_NAME
                },
                subject="Reset Your Password",
                html_content=html_content
            )
            
            response = self.email_api.send_transac_email(send_smtp_email)
            
            return {
                "status": "sent",
                "message_id": response.message_id,
                "sent_at": datetime.now().isoformat()
            }
            
        except ApiException as e:
            logger.error(f"Failed to send password reset email: {e}")
            return {
                "status": "failed",
                "error": str(e)
            }