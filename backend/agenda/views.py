from rest_framework import viewsets, permissions
from .models import HorarioDisponible
from .serializers import HorarioDisponibleSerializer
from usuarios.models import Usuario

class IsEspecialistaOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.rol == Usuario.Roles.ESPECIALISTA

class HorarioViewSet(viewsets.ModelViewSet):
    serializer_class = HorarioDisponibleSerializer
    permission_classes = [IsEspecialistaOrReadOnly]

    def get_queryset(self):
        # Everyone can see available slots
        # Specialists can see their own slots (even if booked)
        if self.request.user.is_staff:
             return HorarioDisponible.objects.all()
        
        queryset = HorarioDisponible.objects.filter(disponible=True, fecha__gte=date.today())
        
        if self.request.user.is_authenticated and self.request.user.rol == Usuario.Roles.ESPECIALISTA:
             # Specialist sees their own schedule including taken slots
             my_slots = HorarioDisponible.objects.filter(especialista=self.request.user)
             return (queryset | my_slots).distinct()
             
        return queryset

from datetime import date
