"use client";

import { useSession } from "@/components/auth/session-context-provider";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, isLoading } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión.');
    } else {
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando panel de administrador...</p>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
        <p className="text-lg mb-4">Acceso denegado. No eres un administrador o no has iniciado sesión.</p>
        <Button onClick={handleLogout}>Cerrar Sesión</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b bg-card">
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <Button onClick={handleLogout} variant="outline">Cerrar Sesión</Button>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}