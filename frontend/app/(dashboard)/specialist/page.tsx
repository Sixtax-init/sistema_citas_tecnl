"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SpecialistDashboard() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!user || user.rol !== 'ESPECIALISTA')) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) return <div className="flex h-screen items-center justify-center">Cargando...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Panel de Especialista</h1>
                        <p className="text-gray-600">Bienvenido, Lic. {user.last_name}</p>
                    </div>
                    <Button variant="outline" onClick={logout}>Cerrar Sesión</Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/specialist/schedule')}>
                        <CardHeader>
                            <CardTitle>Mi Agenda</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">Gestiona tus horarios disponibles.</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/specialist/appointments')}>
                        <CardHeader>
                            <CardTitle>Solicitudes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">Revisa las solicitudes de citas pendientes.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
