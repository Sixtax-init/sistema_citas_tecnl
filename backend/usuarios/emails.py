from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings
from .tokens import account_activation_token

def send_verification_email(user):
    """Send email verification link to user"""
    token = account_activation_token.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    verification_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}"
    
    subject = 'Verifica tu cuenta - Sistema de Citas TECNL'
    
    # HTML email with improved design
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background-color: #f3f4f6;
                margin: 0;
                padding: 0;
                line-height: 1.6;
            }}
            .email-wrapper {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #f3f4f6;
                padding: 20px;
            }}
            .email-container {{
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }}
            .header-icon {{
                font-size: 48px;
                margin-bottom: 10px;
            }}
            .content {{
                padding: 40px 30px;
                color: #374151;
            }}
            .content p {{
                margin: 0 0 16px 0;
                font-size: 16px;
            }}
            .button-container {{
                text-align: center;
                margin: 35px 0;
            }}
            .verify-button {{
                display: inline-block;
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                color: #ffffff !important;
                padding: 16px 40px;
                text-decoration: none;
                border-radius: 8px;
                font-size: 18px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
                transition: all 0.3s ease;
            }}
            .verify-button:hover {{
                box-shadow: 0 6px 16px rgba(37, 99, 235, 0.5);
                transform: translateY(-2px);
            }}
            .link-section {{
                background-color: #f9fafb;
                border-left: 4px solid #2563eb;
                padding: 20px;
                margin: 25px 0;
                border-radius: 6px;
            }}
            .link-section p {{
                margin: 0 0 10px 0;
                font-size: 14px;
                color: #6b7280;
            }}
            .link-text {{
                font-size: 12px;
                color: #2563eb;
                word-break: break-all;
                font-family: 'Courier New', monospace;
                background: #eff6ff;
                padding: 10px;
                border-radius: 4px;
                display: block;
            }}
            .warning-box {{
                background-color: #fef2f2;
                border-left: 4px solid #ef4444;
                padding: 16px;
                margin: 25px 0;
                border-radius: 6px;
            }}
            .warning-box p {{
                margin: 0;
                font-size: 14px;
                color: #991b1b;
            }}
            .footer {{
                background: #f9fafb;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }}
            .footer p {{
                margin: 5px 0;
                font-size: 13px;
                color: #6b7280;
            }}
            .footer strong {{
                color: #374151;
            }}
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="email-container">
                <div class="header">
                    <div class="header-icon">📧</div>
                    <h1>Verifica tu correo electrónico</h1>
                </div>
                
                <div class="content">
                    <p>Hola <strong>{user.first_name}</strong>,</p>
                    
                    <p>¡Bienvenido al Sistema de Citas de TECNL! 🎉</p>
                    
                    <p>Para completar tu registro y poder acceder al sistema, necesitamos verificar tu correo electrónico. Haz clic en el botón de abajo:</p>
                    
                    <div class="button-container">
                        <a href="{verification_link}" class="verify-button">✓ Verificar mi correo</a>
                    </div>
                    
                    <div class="link-section">
                        <p><strong>¿No puedes hacer clic en el botón?</strong></p>
                        <p>Copia y pega el siguiente enlace en tu navegador:</p>
                        <span class="link-text">{verification_link}</span>
                    </div>
                    
                    <div class="warning-box">
                        <p><strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas por seguridad.</p>
                    </div>
                    
                    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                        Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
                    </p>
                </div>
                
                <div class="footer">
                    <p><strong>Sistema de Citas Psicológicas - TECNL</strong></p>
                    <p>Este es un correo automático, por favor no responder.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = f"""
    Hola {user.first_name},
    
    ¡Bienvenido al Sistema de Citas de TECNL!
    
    Para verificar tu correo electrónico, visita el siguiente enlace:
    {verification_link}
    
    Este enlace expirará en 24 horas.
    
    Si no creaste esta cuenta, puedes ignorar este correo.
    
    ---
    Sistema de Citas Psicológicas - TECNL
    """
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )
