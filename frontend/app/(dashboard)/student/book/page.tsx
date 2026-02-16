"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar-custom";

interface Horario {
    id: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    disponible: boolean;
    especialista_nombre?: string;
}

export default function StudentBooking() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // Data
    const [slots, setSlots] = useState<Horario[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(true);

    // Selection
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [bookingSlot, setBookingSlot] = useState<Horario | null>(null);
    const [motivo, setMotivo] = useState("");
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [success, setSuccess] = useState(false);

    const fetchSlots = useCallback(async () => {
        try {
            // Backend: Get all available slots
            const response = await api.get("/agenda/horarios/", {
                params: { disponible: true }
            });
            setSlots(response.data);
        } catch (error) {
            console.error("Error fetching slots", error);
        } finally {
            setLoadingSlots(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading && user?.rol === 'ALUMNO') {
            fetchSlots();
        }
    }, [isLoading, user, fetchSlots]);

    // Derived state: Available dates (string format)
    const availableDates = useMemo(() => {
        return Array.from(new Set(slots.map(s => s.fecha)));
    }, [slots]);

    // Derived state: Slots for selected date
    const daySlots = useMemo(() => {
        if (!selectedDate) return [];
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        return slots.filter(s => s.fecha === dateStr).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
    }, [slots, selectedDate]);

    const handleBook = async () => {
        if (!bookingSlot || !acceptPrivacy) return;
        setIsBooking(true);
        try {
            await api.post("/citas/citas/", {
                horario_id: bookingSlot.id,
                motivo: motivo
            });
            setSuccess(true);
            setTimeout(() => {
                router.push("/student");
            }, 2000);
        } catch (error: unknown) {
            console.error("Error booking", error);
            let msg = "No se pudo agendar la cita. Intenta de nuevo.";
            if (axios.isAxiosError(error) && error.response?.data) {
                // Handle different error formats (DRF returns detail or field errors)
                const data = error.response.data;
                if (data.detail) {
                    msg = data.detail;
                } else if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
                    msg = data.non_field_errors.join("\n");
                } else if (typeof data === 'object') {
                    // Start with an empty string
                    msg = "";
                    // Iterate over keys to build the message
                    Object.keys(data).forEach((key) => {
                        const errorContent = data[key];
                        // If it's an array, join it; otherwise just stringify
                        const errorStr = Array.isArray(errorContent) ? errorContent.join(", ") : String(errorContent);
                        msg += `${key === 'non_field_errors' ? '' : key + ': '}${errorStr}\n`;
                    });
                }
            }
            alert(msg);
            setIsBooking(false); // Only stop loading if error
        }
    };

    if (!user || user.rol !== 'ALUMNO') return null;

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md mx-4 text-center p-6">
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in duration-300" />
                    </div>
                    <CardTitle className="text-2xl mb-2">¡Cita Agendada!</CardTitle>
                    <p className="text-gray-600 mb-6">Tu cita ha sido registrada exitosamente. Redirigiendo al panel...</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Reserva tu Cita</h1>
                        <p className="text-gray-600">Selecciona un día en el calendario y elige tu horario.</p>
                    </div>
                    <Button variant="outline" onClick={() => router.back()}>Volver</Button>
                </header>

                {loadingSlots ? (
                    <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Left Column: Calendar */}
                        <div className="md:col-span-5 lg:col-span-4 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                                        Selecciona Fecha
                                    </CardTitle>
                                    <CardDescription>
                                        Días disponibles: Lunes, Miércoles y Viernes.
                                        <br />
                                        <span className="flex items-center gap-1 mt-1">
                                            <span className="h-2 w-2 rounded-full bg-blue-500 block"></span>
                                            <span className="text-xs">Días con horarios</span>
                                        </span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex justify-center">
                                    <Calendar
                                        selectedDate={selectedDate}
                                        onSelectDate={setSelectedDate}
                                        availableDates={availableDates}
                                        className="border-none shadow-none"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Slots */}
                        <div className="md:col-span-7 lg:col-span-8">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>
                                        {selectedDate
                                            ? `Horarios para el ${selectedDate.toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })}`
                                            : "Selecciona un día"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!selectedDate ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                            <p>Por favor selecciona una fecha en el calendario.</p>
                                        </div>
                                    ) : daySlots.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <p>No hay horarios disponibles para este día.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {daySlots.map((slot) => (
                                                <div key={slot.id} className="border rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <Badge variant="secondary" className="bg-white text-blue-700 border border-blue-100 group-hover:bg-blue-100">
                                                            Disponible
                                                        </Badge>
                                                        <Clock className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                                                    </div>

                                                    <div className="mb-4">
                                                        <p className="text-sm font-medium text-blue-600 mb-1">
                                                            {slot.especialista_nombre || "Especialista"}
                                                        </p>
                                                        <p className="text-2xl font-semibold text-gray-800">
                                                            {slot.hora_inicio.slice(0, 5)}
                                                        </p>
                                                        <p className="text-sm text-gray-500">hasta {slot.hora_fin.slice(0, 5)}</p>
                                                    </div>

                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button className="w-full" onClick={() => { setBookingSlot(slot); setAcceptPrivacy(false); }}>Seleccionar</Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Confirmar Cita</DialogTitle>
                                                                <DialogDescription>
                                                                    Fecha: <strong>{slot.fecha}</strong>
                                                                    <br />
                                                                    Hora: <strong>{slot.hora_inicio.slice(0, 5)} - {slot.hora_fin.slice(0, 5)}</strong>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor="motivo">Motivo de la consulta</Label>
                                                                    <Input
                                                                        id="motivo"
                                                                        placeholder="Describe brevemente..."
                                                                        value={motivo}
                                                                        onChange={(e) => setMotivo(e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                                                    <p className="text-xs font-semibold text-blue-900 mb-2">📋 Aviso de Confidencialidad</p>
                                                                    <p className="text-xs text-blue-800 mb-3">
                                                                        Los datos proporcionados serán utilizados exclusivamente para fines de atención psicológica institucional.
                                                                        La información será tratada de manera confidencial conforme a la normativa vigente.
                                                                    </p>
                                                                    <label className="flex items-start gap-2 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={acceptPrivacy}
                                                                            onChange={(e) => setAcceptPrivacy(e.target.checked)}
                                                                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                        />
                                                                        <span className="text-xs text-gray-700">
                                                                            He leído y acepto el aviso de confidencialidad
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button onClick={handleBook} disabled={isBooking || !motivo.trim() || !acceptPrivacy}>
                                                                    {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                    Confirmar
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
