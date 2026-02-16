from django.db import models
from django.conf import settings

class Notificacion(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notificaciones')
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField()
    leida = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    # Opcional: Relacionar con una cita específica
    cita = models.ForeignKey('citas.Cita', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.usuario} - {self.titulo}"
