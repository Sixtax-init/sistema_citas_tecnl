from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .emails import send_verification_email

Usuario = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Usuario
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'rol', 'password', 'matricula', 'telefono', 'email_verified')
        read_only_fields = ('id', 'rol', 'email_verified')

    def validate_email(self, value):
        # Temporarily allow any email domain for testing
        # if not value.endswith('@tecnl.mx'):
        #     raise serializers.ValidationError("Solo se permiten correos institucionales (@tecnl.mx)")
        return value

    def create(self, validated_data):
        # Auto-generate username from first_name + last_name if not provided
        if not validated_data.get('username'):
            first = validated_data.get('first_name', '').lower().replace(' ', '')
            last = validated_data.get('last_name', '').lower().replace(' ', '')
            base_username = f"{first}.{last}"
            
            # Ensure uniqueness by appending a number if needed
            username = base_username
            counter = 1
            while Usuario.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            validated_data['username'] = username
        
        # Default role is ALUMNO if not specified
        validated_data['rol'] = Usuario.Roles.ALUMNO
        user = Usuario.objects.create_user(**validated_data)
        
        # Send verification email
        try:
            send_verification_email(user)
        except Exception as e:
            # Log error but don't fail registration
            print(f"⚠️ Error sending verification email: {e}")
            # In production, you might want to log this to a monitoring service
        
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['email'] = user.email
        token['rol'] = user.rol
        token['full_name'] = f"{user.first_name} {user.last_name}"
        token['email_verified'] = user.email_verified
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Check if email is verified
        if not self.user.email_verified:
            raise serializers.ValidationError(
                "Debes verificar tu correo electrónico antes de iniciar sesión. "
                "Revisa tu bandeja de entrada y haz clic en el enlace de verificación."
            )
        
        return data
