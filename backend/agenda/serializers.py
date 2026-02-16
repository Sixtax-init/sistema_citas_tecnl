from rest_framework import serializers
from .models import HorarioDisponible
from datetime import date

class HorarioDisponibleSerializer(serializers.ModelSerializer):
    especialista_nombre = serializers.SerializerMethodField()

    class Meta:
        model = HorarioDisponible
        fields = '__all__'
        read_only_fields = ('especialista', 'disponible', 'especialista_nombre')

    def get_especialista_nombre(self, obj):
        return f"{obj.especialista.first_name} {obj.especialista.last_name}"

    def validate_fecha(self, value):
        # 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday
        if value.weekday() not in [0, 1, 2, 3, 4]:
            raise serializers.ValidationError("Las citas solo pueden programarse de Lunes a Viernes.")
        if value < date.today():
             raise serializers.ValidationError("No se pueden crear horarios en fechas pasadas.")
        return value

    def validate(self, data):
        # Check for overlapping slots for the same specialist
        user = self.context['request'].user
        if HorarioDisponible.objects.filter(
            especialista=user,
            fecha=data['fecha'],
            hora_inicio=data['hora_inicio']
        ).exists():
            raise serializers.ValidationError("Ya existe un horario con la misma fecha y hora de inicio.")
        
        if data['hora_inicio'] >= data['hora_fin']:
            raise serializers.ValidationError("La hora de inicio debe ser anterior a la hora de fin.")
            
        return data

    def create(self, validated_data):
        validated_data['especialista'] = self.context['request'].user
        return super().create(validated_data)
