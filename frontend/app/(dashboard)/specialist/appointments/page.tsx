"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, CheckCircle, XCircle, User } from "lucide-react";

interface Cita {
    id: number;
    alumno: number;
    especialista: number;
    horario_detalles?: {
        fecha: string;
        hora_inicio: string;
        hora_fin: string;
    };
    motivo: string;
    estado: 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA' | 'COMPLETADA' | 'CANCELADA';
    fecha_creacion: string;
    alumno_detalles?: {
        first_name: string;
        last_name: string;
        email: string;
        telefono?: string;
        matricula?: string;
    }
}

export default function SpecialistAppointments() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [citas, setCitas] = useState<Cita[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'PENDIENTE' | 'CONFIRMADA' | 'ALL'>('PENDIENTE');
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchCitas = useCallback(async () => {
        try {
            const response = await api.get("/citas/citas/");
            setCitas(response.data);
        } catch (error) {
            console.error("Error fetching citas", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading && user?.rol === 'ESPECIALISTA') {
            fetchCitas();
        }
    }, [isLoading, user, fetchCitas]);

    const handleAction = async (id: number, action: 'confirmar' | 'rechazar' | 'completar') => {
        if (!confirm(`¿Estás seguro de que deseas ${action} esta cita?`)) return;
        setProcessingId(id);
        try {
            await api.post(`/citas/citas/${id}/${action}/`);
            // Refresh list
            fetchCitas();
        } catch (error: unknown) {
            console.error(`Error ${action} cita`, error);
            alert("Ocurrió un error al procesar la solicitud.");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredCitas = citas.filter(c => {
        if (filter === 'ALL') return ['COMPLETADA', 'RECHAZADA', 'CANCELADA', 'NO_ASISTIO'].includes(c.estado);
        return c.estado === filter;
    });

    if (!user || user.rol !== 'ESPECIALISTA') return null;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Gestión de Citas</h1>
                        <p className="text-gray-600">Revisa y administra las solicitudes de los alumnos.</p>
                    </div>
                    <Button variant="outline" onClick={() => router.back()}>Volver</Button>
                </header>

                {/* Tabs / Filters */}
                <div className="flex gap-4 border-b pb-2">
                    <button
                        onClick={() => setFilter('PENDIENTE')}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${filter === 'PENDIENTE' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Pendientes
                        {citas.filter(c => c.estado === 'PENDIENTE').length > 0 && (
                            <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">{citas.filter(c => c.estado === 'PENDIENTE').length}</Badge>
                        )}
                    </button>
                    <button
                        onClick={() => setFilter('CONFIRMADA')}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${filter === 'CONFIRMADA' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Confirmadas
                    </button>
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${filter === 'ALL' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Historial Completo
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                ) : filteredCitas.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <p className="text-gray-500">No hay citas en esta categoría.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredCitas.map((cita) => (
                            <Card key={cita.id} className="overflow-hidden">
                                <div className="flex flex-col md:flex-row border-l-4 border-blue-500">
                                    <div className="p-6 flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant={
                                                        cita.estado === 'PENDIENTE' ? 'secondary' :
                                                            cita.estado === 'CONFIRMADA' ? 'default' :
                                                                cita.estado === 'RECHAZADA' ? 'destructive' : 'outline'
                                                    }>
                                                        {cita.estado}
                                                    </Badge>
                                                    <span className="text-xs text-gray-400">ID: #{cita.id}</span>
                                                </div>
                                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    {cita.horario_detalles?.fecha || "Fecha N/A"}
                                                    <span className="text-gray-300">|</span>
                                                    <Clock className="h-4 w-4 text-gray-500" />
                                                    {cita.horario_detalles?.hora_inicio.slice(0, 5)} - {cita.horario_detalles?.hora_fin.slice(0, 5)}
                                                </h3>
                                            </div>
                                            {cita.estado === 'PENDIENTE' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleAction(cita.id, 'confirmar')}
                                                        disabled={processingId === cita.id}
                                                    >
                                                        {processingId === cita.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                                        Confirmar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleAction(cita.id, 'rechazar')}
                                                        disabled={processingId === cita.id}
                                                    >
                                                        {processingId === cita.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                                                        Rechazar
                                                    </Button>
                                                </div>
                                            )}
                                            {cita.estado === 'CONFIRMADA' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                        onClick={() => handleAction(cita.id, 'completar')}
                                                        disabled={processingId === cita.id}
                                                    >
                                                        {processingId === cita.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                                        Terminar Cita
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Alumno</p>
                                                <div className="flex items-start gap-3">
                                                    <User className="h-10 w-10 p-2 bg-blue-100 rounded-full text-blue-600 flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-sm text-gray-900">
                                                            {cita.alumno_detalles?.first_name} {cita.alumno_detalles?.last_name}
                                                        </p>
                                                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                                                            <span>📧</span>
                                                            <span className="truncate">{cita.alumno_detalles?.email}</span>
                                                        </p>
                                                        {cita.alumno_detalles?.telefono && cita.alumno_detalles.telefono !== "No proporcionado" && (
                                                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                                                                <span>📱</span>
                                                                {cita.alumno_detalles.telefono}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <span>🎓</span>
                                                            {cita.alumno_detalles?.matricula}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase">Motivo de consulta</p>
                                                <p className="text-sm mt-1 text-gray-700 italic">"{cita.motivo}"</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
