"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
// import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email("Correo inválido").refine(
        (email) => email.endsWith("@tecnl.mx"),
        "Debe ser un correo institucional (@tecnl.mx)"
    ),
    password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    // const router = useRouter(); // Removed router declaration

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post("/auth/login/", data);
            login(response.data.access, response.data.refresh);
        } catch (err: unknown) {
            console.error(err);
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data?.detail || "Error al iniciar sesión. Verifique sus credenciales.");
            } else {
                setError("Error al iniciar sesión. Verifique sus credenciales.");
            }
        } finally {
            setLoading(false);
        }
    };

    const fillDemoStudent = () => {
        setValue("email", "alumno@tecnl.mx");
        setValue("password", "password123");
    };

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            {/* Left Column: Form */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-full max-w-sm gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Iniciar Sesión</h1>
                        <p className="text-balance text-muted-foreground">
                            Ingresa tu correo institucional para acceder
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium">Correo</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="usuario@tecnl.mx"
                                    {...register("email")}
                                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                        </div>

                        {error && <div className="p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">{error}</div>}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Entrando..." : "Entrar"}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        ¿No tienes cuenta?{" "}
                        <Link href="/register" className="underline hover:text-blue-600">
                            Regístrate
                        </Link>
                    </div>

                    {/* Demo Credentials Helper */}
                    <div className="mt-8 p-4 bg-slate-50 dark:bg-zinc-900 rounded-lg text-xs text-slate-500 border border-slate-200 dark:border-zinc-800">
                        <p className="font-semibold mb-2">Credenciales de Demo:</p>
                        <div className="flex justify-between items-center bg-white dark:bg-black p-2 rounded border border-slate-100 dark:border-zinc-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                            onClick={fillDemoStudent}>
                            <div>
                                <span className="block text-slate-700 dark:text-slate-300">alumno@tecnl.mx</span>
                                <span className="block text-slate-400">password123</span>
                            </div>
                            <Button variant="ghost" size="sm" type="button" className="text-[10px] h-6">Usar</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Visuals */}
            <div className="hidden bg-slate-100 dark:bg-zinc-900 lg:flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/10 dark:bg-blue-900/20 backdrop-blur-[1px]"></div>
                {/* Abstract geometric pattern */}
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80')] bg-cover bg-center opacity-50 dark:opacity-30 mix-blend-multiply"></div>
                <div className="absolute z-10 p-12 text-blue-900 dark:text-white">
                    <h2 className="text-4xl font-bold mb-4">Bienvenido de nuevo</h2>
                    <p className="text-xl max-w-md">Accede a tu panel personalizado para gestionar tus citas y notificaciones.</p>
                </div>
            </div>
        </div>
    );
}
