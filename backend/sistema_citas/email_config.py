# Quick fix: Add email settings to a separate file and import it
# Email Configuration (Development)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'Sistema de Citas TECNL <noreply@tecnl.mx>'
EMAIL_SUBJECT_PREFIX = '[TECNL] '

# Frontend URL for email links
FRONTEND_URL = 'http://localhost:3000'
