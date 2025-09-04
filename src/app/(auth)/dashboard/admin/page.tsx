"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/components/auth/session-context-provider";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const { user, profile, isLoading } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
    } else {
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando dashboard de administrador...</p>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Acceso denegado. No eres un administrador o no has iniciado sesión.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-4">Panel de Administrador</h1>
      <p className="text-lg mb-6">Bienvenido, {profile?.first_name} {profile?.last_name}!</p>
      <p className="text-md mb-8">Aquí podrás gestionar abogados, solicitudes y ver métricas globales.</p>
      <Button onClick={handleLogout}>Cerrar Sesión</Button>
    </div>
  );
}