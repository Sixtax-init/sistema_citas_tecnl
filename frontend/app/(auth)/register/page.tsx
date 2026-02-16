"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/axios";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
    email: z.string().email("Correo inválido"),
    // Temporarily allow any email domain for testing
    // .refine(
    //     (email) => email.endsWith("@tecnl.mx"),
    //     "Debe ser un correo institucional (@tecnl.mx)"
    // ),
    first_name: z.string().min(2, "Nombre requerido"),
    last_name: z.string().min(2, "Apellido requerido"),
    matricula: z.string().min(4, "Matrícula requerida (mínimo 4 caracteres)"),
    telefono: z.string().min(10, "Teléfono requerido (mínimo 10 dígitos)").regex(/^[0-9-]+$/, "Solo números y guiones"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setLoading(true);
        setError(null);
        try {
            // Remove confirmPassword before sending
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...submitData } = data;
            await api.post("/auth/register/", submitData);
            router.push("/login?registered=true");
        } catch (err: unknown) {
            console.error(err);
            // Handle Django error format usually { "field": ["error"] }
            if (axios.isAxiosError(err) && err.response) {
                const serverErrors = err.response.data;
                if (serverErrors) {
                    if (typeof serverErrors === 'string') {
                        setError(serverErrors);
                    } else {
                        // Just take the first error found
                        const firstKey = Object.keys(serverErrors)[0];
                        const firstError = Array.isArray(serverErrors[firstKey]) ? serverErrors[firstKey][0] : serverErrors[firstKey];
                        setError(`${firstKey}: ${firstError}`);
                    }
                } else {
                    setError("Error al registrarse. Intente nuevamente.");
                }
            } else {
                setError("Error inesperado al registrarse.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
                    <CardDescription className="text-center">
                        Regístrate para agendar citas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre</label>
                                <Input {...register("first_name")} className={errors.first_name ? "border-red-500" : ""} />
                                {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Apellido</label>
                                <Input {...register("last_name")} className={errors.last_name ? "border-red-500" : ""} />
                                {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Matrícula</label>
                                <Input placeholder="20240001" {...register("matricula")} className={errors.matricula ? "border-red-500" : ""} />
                                {errors.matricula && <p className="text-xs text-red-500">{errors.matricula.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Teléfono</label>
                                <Input placeholder="555-1234" {...register("telefono")} className={errors.telefono ? "border-red-500" : ""} />
                                {errors.telefono && <p className="text-xs text-red-500">{errors.telefono.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Correo Institucional</label>
                            <Input type="email" placeholder="@tecnl.mx" {...register("email")} className={errors.email ? "border-red-500" : ""} />
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Contraseña</label>
                            <Input type="password" {...register("password")} className={errors.password ? "border-red-500" : ""} />
                            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirmar Contraseña</label>
                            <Input type="password" {...register("confirmPassword")} className={errors.confirmPassword ? "border-red-500" : ""} />
                            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                        </div>

                        {error && <div className="p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Registrando..." : "Registrarse"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        ¿Ya tienes cuenta?{" "}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
