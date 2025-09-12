"""
Email template rendering API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
import subprocess
import json
import tempfile
import os
from pathlib import Path

from app.core.logging import get_logger
from app.schemas.base import BaseResponse

logger = get_logger(__name__)

router = APIRouter(prefix="/email-templates", tags=["Email Templates"])

class EmailTemplateRenderer:
    """Service for rendering React email templates"""
    
    def __init__(self):
        self.frontend_dir = Path(__file__).parent.parent.parent.parent.parent / "src"
        self.email_renderer_path = self.frontend_dir / "lib" / "emailRenderer.ts"
    
    async def render_template(
        self, 
        template_name: str, 
        data: Dict[str, Any]
    ) -> Dict[str, str]:
        """Render a React email template to HTML and text"""
        try:
            # Create a temporary script to render the template
            script_content = f"""
import EmailRenderer from './lib/emailRenderer';
import {{ render }} from '@react-email/components';

const result = EmailRenderer.renderTemplate('{template_name}', {json.dumps(data)});
console.log(JSON.stringify(result));
"""
            
            # Write the script to a temporary file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.ts', delete=False) as f:
                f.write(script_content)
                script_path = f.name
            
            try:
                # Run the script using ts-node
                result = subprocess.run(
                    [
                        'npx', 'ts-node', 
                        '--project', str(self.frontend_dir.parent / 'tsconfig.json'),
                        script_path
                    ],
                    cwd=self.frontend_dir,
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                if result.returncode != 0:
                    logger.error(f"Failed to render template: {result.stderr}")
                    raise HTTPException(
                        status_code=500, 
                        detail="Failed to render email template"
                    )
                
                # Parse the JSON output
                rendered = json.loads(result.stdout.strip())
                return rendered
                
            finally:
                # Clean up temporary file
                os.unlink(script_path)
                
        except Exception as e:
            logger.error(f"Error rendering email template: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to render email template: {str(e)}"
            )

# Global renderer instance
email_renderer = EmailTemplateRenderer()

@router.post("/render/{template_name}")
async def render_email_template(
    template_name: str,
    data: Dict[str, Any]
) -> BaseResponse:
    """Render a React email template to HTML and text"""
    try:
        rendered = await email_renderer.render_template(template_name, data)
        
        return BaseResponse(
            success=True,
            data=rendered,
            message="Email template rendered successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in render_email_template: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@router.get("/available")
async def get_available_templates() -> BaseResponse:
    """Get list of available email templates"""
    try:
        # This would need to be implemented to read from the frontend
        templates = [
            "welcome-verify",
            "password-reset",
            "booking-confirmation", 
            "host-notification"
        ]
        
        return BaseResponse(
            success=True,
            data={"templates": templates},
            message="Available templates retrieved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting available templates: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )
