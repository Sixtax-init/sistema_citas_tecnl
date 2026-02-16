from django.db import models
from django.conf import settings

class HorarioDisponible(models.Model):
    especialista = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='horarios')
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    disponible = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.especialista} - {self.fecha} ({self.hora_inicio} - {self.hora_fin})"
