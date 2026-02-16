from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth import get_user_model
from .tokens import account_activation_token

Usuario = get_user_model()

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, uidb64, token):
    """Verify user's email address"""
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = Usuario.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, Usuario.DoesNotExist):
        return Response(
            {"error": "Enlace de verificación inválido"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if account_activation_token.check_token(user, token):
        if user.email_verified:
            return Response(
                {"message": "El correo ya ha sido verificado anteriormente"},
                status=status.HTTP_200_OK
            )
        
        user.email_verified = True
        user.save()
        return Response(
            {"message": "¡Correo verificado exitosamente! Ya puedes iniciar sesión."},
            status=status.HTTP_200_OK
        )
    else:
        return Response(
            {"error": "El enlace de verificación ha expirado o es inválido"},
            status=status.HTTP_400_BAD_REQUEST
        )
