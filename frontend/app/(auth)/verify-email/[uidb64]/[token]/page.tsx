"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import axios from "axios";

export default function VerifyEmailPage() {
    const params = useParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const { uidb64, token } = params;
                // Use axios directly to avoid /api prefix
                const response = await axios.get(`http://localhost:8000/api/auth/verify-email/${uidb64}/${token}/`);
                setStatus('success');
                setMessage(response.data.message);

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login?verified=true');
                }, 3000);
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Error al verificar el correo electrónico');
            }
        };

        verifyEmail();
    }, [params, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">
                        {status === 'loading' && 'Verificando correo...'}
                        {status === 'success' && '✅ Correo verificado'}
                        {status === 'error' && '❌ Error de verificación'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {status === 'loading' && 'Por favor espera mientras verificamos tu correo electrónico'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    {status === 'loading' && (
                        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle2 className="h-16 w-16 text-green-600" />
                            <p className="text-center text-sm text-gray-600">{message}</p>
                            <p className="text-center text-xs text-gray-500">
                                Serás redirigido al inicio de sesión en unos segundos...
                            </p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="h-16 w-16 text-red-600" />
                            <p className="text-center text-sm text-red-600">{message}</p>
                            <Button onClick={() => router.push('/login')} className="mt-4">
                                Ir al inicio de sesión
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
