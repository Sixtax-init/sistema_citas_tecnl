from django.db import models
from django.conf import settings

class Cita(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Pendiente'
        CONFIRMADA = 'CONFIRMADA', 'Confirmada'
        RECHAZADA = 'RECHAZADA', 'Rechazada'
        COMPLETADA = 'COMPLETADA', 'Completada'
        NO_ASISTIO = 'NO_ASISTIO', 'No Asistió'
        CANCELADA = 'CANCELADA', 'Cancelada'

    alumno = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='citas_alumno')
    especialista = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='citas_especialista')
    horario = models.OneToOneField('agenda.HorarioDisponible', on_delete=models.CASCADE)
    motivo = models.TextField()
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.PENDIENTE)
    google_event_id = models.CharField(max_length=255, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cita: {self.alumno} con {self.especialista} - {self.estado}"
