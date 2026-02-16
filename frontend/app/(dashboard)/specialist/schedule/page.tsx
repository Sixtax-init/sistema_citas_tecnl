"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus, Calendar as CalendarIcon, Loader2 } from "lucide-react";

// Schema for creating a slot
const slotSchema = z.object({
    fecha: z.string().refine((date) => {
        const d = new Date(date);
        // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
        // User update: Specialists work Mon-Fri
        const day = d.getUTCDay();
        return [1, 2, 3, 4, 5].includes(day);
    }, "Solo se permiten días de Lunes a Viernes"),
    hora_inicio: z.string(),
    hora_fin: z.string()
});

type SlotFormValues = z.infer<typeof slotSchema>;

interface Horario {
    id: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    disponible: boolean;
}

import { Calendar } from "@/components/ui/calendar-custom";

export default function SpecialistSchedule() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [slots, setSlots] = useState<Horario[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setError,
        setValue,
        clearErrors
    } = useForm<SlotFormValues>({
        resolver: zodResolver(slotSchema),
    });

    const fetchSlots = useCallback(async () => {
        try {
            // Backend filters by 'me' automatically if we implemented it, 
            // or we need to filter. Let's assume the ViewSet returns all if not filtered,
            // so strictly we should filter or the backend should.
            // Checking backend views.py (from memory/context): HorarioViewSet get_queryset filters by user if specialist.
            const response = await api.get("/agenda/horarios/");
            setSlots(response.data);
        } catch (error) {
            console.error("Error fetching slots", error);
        } finally {
            setLoadingSlots(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading && user?.rol === 'ESPECIALISTA') {
            fetchSlots();
        }
    }, [isLoading, user, fetchSlots]);

    const onSubmit = async (data: SlotFormValues) => {
        setIsCreating(true);
        try {
            // Ensure time format is HH:MM:SS for Django TimeField
            const formatTime = (time: string) => {
                if (!time) return time;
                const parts = time.split(':');
                if (parts.length === 2) {
                    return `${time}:00`;
                }
                return time;
            };

            await api.post("/agenda/horarios/", {
                ...data,
                hora_inicio: formatTime(data.hora_inicio),
                hora_fin: formatTime(data.hora_fin),
                especialista: user?.id
            });
            reset();
            fetchSlots();
        } catch (err: unknown) {
            console.error(err);
            if (axios.isAxiosError(err) && err.response?.data) {
                // Map backend errors to form
                // e.g. non_field_errors
                const serverErrors = err.response.data;
                if (serverErrors.non_field_errors) {
                    setError("root", { message: serverErrors.non_field_errors[0] });
                } else {
                    // naive mapping
                    Object.keys(serverErrors).forEach((key) => {
                        const errorMsg = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key];
                        // @ts-expect-error: dynamic key mapping for form errors
                        setError(key, { message: errorMsg });
                    });
                }
            }
        } finally {
            setIsCreating(false);
        }
    };

    const deleteSlot = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar este horario?")) return;
        try {
            await api.delete(`/agenda/horarios/${id}/`);
            setSlots(slots.filter(s => s.id !== id));
        } catch (error) {
            console.error("Error deleting slot", error);
            alert("No se pudo eliminar el horario. Es posible que ya tenga una cita agendada.");
        }
    };

    if (!user || user.rol !== 'ESPECIALISTA') return null;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Gestionar Mi Agenda</h1>
                        <p className="text-gray-600">Crea y administra tus horarios de atención.</p>
                    </div>
                    <Button variant="outline" onClick={() => router.back()}>Volver</Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Create Slot Form */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle>Nuevo Horario</CardTitle>
                            <CardDescription>Solo Lunes, Miércoles y Viernes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label>Fecha</Label>
                                    <div className="border rounded-md p-4 flex justify-center bg-white">
                                        <Calendar
                                            selectedDate={selectedDate}
                                            onSelectDate={(date) => {
                                                setSelectedDate(date);
                                                if (date) {
                                                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                                    setValue("fecha", dateStr);
                                                    clearErrors("fecha");
                                                } else {
                                                    setValue("fecha", "");
                                                }
                                            }}
                                            availableDates={slots.map(s => s.fecha)}
                                            className="border-none shadow-none"
                                        />
                                    </div>
                                    <input type="hidden" {...register("fecha")} />
                                    {errors.fecha && <p className="text-sm text-red-500">{errors.fecha.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="hora_inicio">Hora Inicio</Label>
                                        <Input id="hora_inicio" type="time" {...register("hora_inicio")} />
                                        {errors.hora_inicio && <p className="text-sm text-red-500">{errors.hora_inicio.message}</p>}
                                    </div>
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="hora_fin">Hora Fin</Label>
                                        <Input id="hora_fin" type="time" {...register("hora_fin")} />
                                        {errors.hora_fin && <p className="text-sm text-red-500">{errors.hora_fin.message}</p>}
                                    </div>
                                </div>

                                {errors.root && <div className="p-2 bg-red-50 text-red-600 text-xs rounded">{errors.root.message}</div>}

                                <Button type="submit" className="w-full" disabled={isCreating}>
                                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    Crear Horario
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Slots List */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Horarios Disponibles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingSlots ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                            ) : slots.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No has creado horarios aún.</p>
                            ) : (
                                <div className="space-y-4">
                                    {slots.map((slot) => (
                                        <div key={slot.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                                    <CalendarIcon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{slot.fecha}</p>
                                                    <p className="text-sm text-gray-500">{slot.hora_inicio.slice(0, 5)} - {slot.hora_fin.slice(0, 5)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${slot.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {slot.disponible ? 'Disponible' : 'Ocupado'}
                                                </span>
                                                {slot.disponible && (
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteSlot(slot.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
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
