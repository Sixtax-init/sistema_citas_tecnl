from rest_framework import serializers
from .models import Cita
from agenda.models import HorarioDisponible
from django.db import transaction

class CitaSerializer(serializers.ModelSerializer):
    horario_id = serializers.PrimaryKeyRelatedField(
        queryset=HorarioDisponible.objects.filter(disponible=True),
        source='horario',
        write_only=True
    )
    horario_detalles = serializers.SerializerMethodField()
    alumno_detalles = serializers.SerializerMethodField()

    class Meta:
        model = Cita
        fields = ('id', 'alumno', 'especialista', 'horario_id', 'horario_detalles', 'alumno_detalles', 'motivo', 'estado', 'fecha_creacion')
        read_only_fields = ('id', 'alumno', 'especialista', 'horario_detalles', 'alumno_detalles', 'estado', 'fecha_creacion')

    def get_horario_detalles(self, obj):
        return {
            "fecha": obj.horario.fecha,
            "hora_inicio": obj.horario.hora_inicio,
            "hora_fin": obj.horario.hora_fin,
            "especialista_nombre": f"{obj.especialista.first_name} {obj.especialista.last_name}"
        }

    def get_alumno_detalles(self, obj):
        return {
            "first_name": obj.alumno.first_name,
            "last_name": obj.alumno.last_name,
            "email": obj.alumno.email,
            "telefono": obj.alumno.telefono or "No proporcionado",
            "matricula": obj.alumno.matricula or "N/A"
        }

    def validate(self, data):
        user = self.context['request'].user
        
        # Check if user has an active appointment (PENDIENTE or CONFIRMADA)
        active_appointments = Cita.objects.filter(
            alumno=user,
            estado__in=[Cita.Estado.PENDIENTE, Cita.Estado.CONFIRMADA]
        ).exists()

        if active_appointments:
            raise serializers.ValidationError("Ya tienes una cita activa. Debes completarla o cancelarla antes de agendar otra.")

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        horario = validated_data['horario']

        with transaction.atomic():
            # Double check availability inside transaction
            if not horario.disponible:
                raise serializers.ValidationError("El horario seleccionado ya no está disponible.")

            # Mark slot as unavailable
            horario.disponible = False
            horario.save()

            cita = Cita.objects.create(
                alumno=user,
                especialista=horario.especialista,
                horario=horario,
                motivo=validated_data['motivo'],
                estado=Cita.Estado.PENDIENTE
            )
            return cita
