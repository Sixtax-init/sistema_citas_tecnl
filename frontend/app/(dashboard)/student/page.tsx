"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Basic interface for the dashboard view
interface CitaSummary {
    id: number;
    fecha: string;
    hora_inicio: string;
    estado: string;
    horario_detalles?: {
        fecha: string;
        hora_inicio: string;
        hora_fin: string;
    };
}

export default function StudentDashboard() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [citas, setCitas] = useState<CitaSummary[]>([]);
    const [loadingCitas, setLoadingCitas] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || user.rol !== 'ALUMNO')) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const fetchCitas = useCallback(async () => {
        try {
            const response = await api.get("/citas/citas/");
            setCitas(response.data);
        } catch (error) {
            console.error("Error fetching citas", error);
        } finally {
            setLoadingCitas(false);
        }
    }, []);

    useEffect(() => {
        if (user?.rol === 'ALUMNO') {
            fetchCitas();
        }
    }, [user, fetchCitas]);

    if (authLoading || !user) return <div className="flex h-screen items-center justify-center">Cargando...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Panel de Alumno</h1>
                        <p className="text-gray-600">Bienvenido, {user.first_name}</p>
                    </div>
                    <Button variant="outline" onClick={logout}>Cerrar Sesión</Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/student/book')}>
                        <CardHeader>
                            <CardTitle>Agendar Cita</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">Reserva una nueva cita con un especialista.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Mis Citas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingCitas ? (
                                <p className="text-sm text-gray-500">Cargando citas...</p>
                            ) : citas.length === 0 ? (
                                <p className="text-sm text-gray-500">No tienes citas activas.</p>
                            ) : (
                                <div className="space-y-4">
                                    {citas.map((cita) => (
                                        <div key={cita.id} className="p-3 bg-white border rounded shadow-sm">
                                            <p className="font-semibold text-blue-600">{cita.horario_detalles?.fecha || "Fecha pendiente"}</p>
                                            <p className="text-sm">{cita.horario_detalles?.hora_inicio.slice(0, 5)} - {cita.horario_detalles?.hora_fin.slice(0, 5)}</p>
                                            <p className="text-xs text-gray-400 mt-1">Estado: {cita.estado}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
