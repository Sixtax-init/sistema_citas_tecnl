from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    class Roles(models.TextChoices):
        ALUMNO = 'ALUMNO', 'Alumno'
        ESPECIALISTA = 'ESPECIALISTA', 'Especialista'
        ADMIN = 'ADMIN', 'Administrador'

    email = models.EmailField(unique=True)
    rol = models.CharField(max_length=20, choices=Roles.choices, default=Roles.ALUMNO)
    matricula = models.CharField(max_length=20, blank=True, null=True, unique=True, help_text="Solo para alumnos")
    telefono = models.CharField(max_length=15, blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    
    # Especialista fields
    departamento = models.ForeignKey('departamentos.Departamento', on_delete=models.SET_NULL, null=True, blank=True, related_name='especialistas')
    cedula = models.CharField(max_length=50, blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.rol})"
