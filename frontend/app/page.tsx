import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, ShieldCheck, BellRing, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-zinc-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-900 dark:text-blue-400">
            <CalendarCheck className="h-6 w-6" />
            <span>Sistema Institucional</span>
          </div>
          <nav className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32 bg-slate-50 dark:bg-zinc-900">
          <div className="container mx-auto px-4 relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl mb-6">
                Gestiona tus citas de manera <span className="text-blue-600">rápida y segura</span>
              </h1>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                La plataforma oficial para agendar consultas con especialistas de la institución. Olvídate de las filas y asegura tu espacio con tu correo institucional.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/login">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Agendar Cita Ahora <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                    Más Información
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative background elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white dark:bg-zinc-950">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                ¿Por qué usar el sistema?
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                Diseñado para optimizar tu tiempo y brindarte la mejor atención.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-0 shadow-lg bg-slate-50 dark:bg-zinc-900">
                <CardHeader>
                  <CalendarCheck className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Agenda Flexible</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    Visualiza los horarios disponibles en tiempo real y reserva el espacio que mejor se adapte a ti.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-slate-50 dark:bg-zinc-900">
                <CardHeader>
                  <ShieldCheck className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Validación Institucional</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    Acceso exclusivo y seguro mediante tu correo institucional (@tecnl.mx), garantizando la privacidad.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-slate-50 dark:bg-zinc-900">
                <CardHeader>
                  <BellRing className="h-10 w-10 text-blue-600 mb-2" />
                  <CardTitle>Recordatorios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400">
                    Recibe notificaciones automáticas y sincroniza tus citas directamente con Google Calendar.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-slate-50 dark:bg-zinc-900 py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Sistema Institucional de Citas. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
