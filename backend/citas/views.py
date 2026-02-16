from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Cita
from .serializers import CitaSerializer
from usuarios.models import Usuario

class CitaViewSet(viewsets.ModelViewSet):
    serializer_class = CitaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.rol == Usuario.Roles.ESPECIALISTA:
            return Cita.objects.filter(especialista=user).order_by('-fecha_creacion')
        return Cita.objects.filter(alumno=user).order_by('-fecha_creacion')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def confirmar(self, request, pk=None):
        cita = self.get_object()
        if request.user != cita.especialista:
            return Response({"error": "No tienes permiso para confirmar esta cita."}, status=status.HTTP_403_FORBIDDEN)
        
        if cita.estado != Cita.Estado.PENDIENTE:
            return Response({"error": "Solo se pueden confirmar citas pendientes."}, status=status.HTTP_400_BAD_REQUEST)

        cita.estado = Cita.Estado.CONFIRMADA
        cita.save()
        # TODO: Trigger Google Calendar Event Creation here
        return Response({"status": "Cita confirmada"})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rechazar(self, request, pk=None):
        cita = self.get_object()
        if request.user != cita.especialista:
             return Response({"error": "No tienes permiso para rechazar esta cita."}, status=status.HTTP_403_FORBIDDEN)

        cita.estado = Cita.Estado.RECHAZADA
        # Free up the slot
        cita.horario.disponible = True
        cita.horario.save()
        cita.save()
        return Response({"status": "Cita rechazada"})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def completar(self, request, pk=None):
        cita = self.get_object()
        if request.user != cita.especialista:
             return Response({"error": "No tienes permiso para completar esta cita."}, status=status.HTTP_403_FORBIDDEN)
        
        if cita.estado != Cita.Estado.CONFIRMADA:
            return Response({"error": "Solo se pueden completar citas confirmadas."}, status=status.HTTP_400_BAD_REQUEST)

        cita.estado = Cita.Estado.COMPLETADA
        cita.save()
        return Response({"status": "Cita completada"})
