"""
Email service for sending transactional emails with templates using Resend
"""

import httpx
from typing import Dict, List, Optional, Any
import jinja2
import os
from pathlib import Path
import logging
from datetime import datetime

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

class EmailService:
    """Service for sending emails with templates using Resend API"""

    def __init__(self):
        self.resend_api_key = getattr(settings, 'RESEND_API_KEY', '')
        self.from_email = getattr(settings, 'FROM_EMAIL', 'noreply@hiddystays.com')
        self.from_name = getattr(settings, 'FROM_NAME', 'HiddyStays')
        self.resend_base_url = "https://api.resend.com"

        # Setup Jinja2 for email templates
        template_dir = Path(__file__).parent.parent / 'templates' / 'emails'
        self.template_env = jinja2.Environment(
            loader=jinja2.FileSystemLoader(template_dir),
            autoescape=jinja2.select_autoescape(['html', 'xml'])
        )

    def _render_template(self, template_name: str, context: Dict[str, Any]) -> tuple[str, str]:
        """Render HTML and text email templates"""
        try:
            # Add common context variables
            context.update({
                'app_name': 'HiddyStays',
                'app_url': getattr(settings, 'APP_URL', 'https://hiddystays.com'),
                'year': datetime.now().year,
                'support_email': getattr(settings, 'SUPPORT_EMAIL', 'support@hiddystays.com'),
            })

            # Render HTML template
            html_template = self.template_env.get_template(f"{template_name}.html")
            html_content = html_template.render(**context)

            # Try to render text template, fallback to HTML without tags
            try:
                text_template = self.template_env.get_template(f"{template_name}.txt")
                text_content = text_template.render(**context)
            except jinja2.TemplateNotFound:
                # Simple HTML to text conversion
                import re
                text_content = re.sub('<[^<]+?>', '', html_content)
                text_content = re.sub(r'\n\s*\n', '\n\n', text_content)

            return html_content, text_content

        except Exception as e:
            logger.error(f"Failed to render email template {template_name}: {e}")
            raise

    async def send_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any],
        to_name: Optional[str] = None
    ) -> bool:
        """Send email using Resend API and template"""
        try:
            # Render templates
            html_content, text_content = self._render_template(template_name, context)

            # Prepare email data for Resend API
            email_data = {
                "from": f"{self.from_name} <{self.from_email}>",
                "to": [f"{to_name} <{to_email}>" if to_name else to_email],
                "subject": subject,
                "html": html_content,
                "text": text_content
            }

            # Send email via Resend API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.resend_base_url}/emails",
                    headers={
                        "Authorization": f"Bearer {self.resend_api_key}",
                        "Content-Type": "application/json"
                    },
                    json=email_data,
                    timeout=30.0
                )

                if response.status_code == 200:
                    logger.info(f"Email sent successfully to {to_email}")
                    return True
                else:
                    logger.error(f"Resend API error: {response.status_code} - {response.text}")
                    return False

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    async def send_welcome_email(self, user_email: str, user_name: str, verification_url: str) -> bool:
        """Send welcome email with verification"""
        return await self.send_email(
            to_email=user_email,
            to_name=user_name,
            subject="Welcome to HiddyStays! Please verify your email",
            template_name="welcome_verification",
            context={
                'user_name': user_name,
                'verification_url': verification_url,
            }
        )

    async def send_password_reset_email(self, user_email: str, user_name: str, reset_url: str) -> bool:
        """Send password reset email"""
        return await self.send_email(
            to_email=user_email,
            to_name=user_name,
            subject="Reset your HiddyStays password",
            template_name="password_reset",
            context={
                'user_name': user_name,
                'reset_url': reset_url,
            }
        )

    async def send_booking_confirmation_email(
        self,
        user_email: str,
        user_name: str,
        booking_details: Dict[str, Any]
    ) -> bool:
        """Send booking confirmation email"""
        return await self.send_email(
            to_email=user_email,
            to_name=user_name,
            subject=f"Booking Confirmation - {booking_details.get('property_name', 'Property')}",
            template_name="booking_confirmation",
            context={
                'user_name': user_name,
                'booking': booking_details,
            }
        )

    async def send_host_notification_email(
        self,
        host_email: str,
        host_name: str,
        booking_details: Dict[str, Any]
    ) -> bool:
        """Send host notification email for new booking"""
        return await self.send_email(
            to_email=host_email,
            to_name=host_name,
            subject=f"New Booking Request - {booking_details.get('property_name', 'Your Property')}",
            template_name="host_notification",
            context={
                'host_name': host_name,
                'booking': booking_details,
            }
        )

    async def send_payment_notification_email(
        self,
        host_email: str,
        host_name: str,
        payment_details: Dict[str, Any]
    ) -> bool:
        """Send payment notification email"""
        return await self.send_email(
            to_email=host_email,
            to_name=host_name,
            subject=f"Payment Received - ${payment_details.get('amount', '0')} CAD",
            template_name="payment_notification",
            context={
                'host_name': host_name,
                'payment': payment_details,
            }
        )

    async def send_admin_notification_email(
        self,
        admin_email: str,
        admin_name: str,
        notification_type: str,
        details: Dict[str, Any]
    ) -> bool:
        """Send admin notification email"""
        return await self.send_email(
            to_email=admin_email,
            to_name=admin_name,
            subject=f"HiddyStays Admin Notification: {notification_type}",
            template_name="admin_notification",
            context={
                'admin_name': admin_name,
                'notification_type': notification_type,
                'details': details,
            }
        )


# Global email service instance
email_service = EmailService()