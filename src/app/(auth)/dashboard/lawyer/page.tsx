"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/components/auth/session-context-provider";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LawyerRequestList } from "@/components/lawyer/lawyer-request-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LawyerDetails {
  id: string;
  full_name: string;
  commune: string;
  specialty: string;
  email: string;
  phone?: string;
  enabled: boolean;
}

export default function LawyerDashboardPage() {
  const { user, profile, isLoading: isSessionLoading } = useSession();
  const router = useRouter();
  const [lawyerDetails, setLawyerDetails] = useState<LawyerDetails | null>(null);
  const [isLoadingLawyer, setIsLoadingLawyer] = useState(true);

  useEffect(() => {
    if (!isSessionLoading && user) {
      const fetchLawyerDetails = async () => {
        setIsLoadingLawyer(true);
        const { data, error } = await supabase
          .from('lawyers')
          .select('id, full_name, commune, specialty, email, phone, enabled')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching lawyer details:', error);
          toast.error('Error al cargar los detalles del abogado.');
          setLawyerDetails(null);
        } else {
          setLawyerDetails(data);
        }
        setIsLoadingLawyer(false);
      };
      fetchLawyerDetails();
    } else if (!isSessionLoading && !user) {
      router.push('/login');
    }
  }, [user, isSessionLoading, router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión.');
    } else {
      router.push('/login');
    }
  };

  if (isSessionLoading || isLoadingLawyer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando panel de abogado...</p>
      </div>
    );
  }

  if (!user || profile?.role !== 'abogado' || !lawyerDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
        <p className="text-lg mb-4">Acceso denegado. No eres un abogado registrado o tu perfil no está completo.</p>
        <Button onClick={handleLogout}>Cerrar Sesión</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-background text-foreground">
      <main className="w-full max-w-4xl space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Panel de Abogado</h1>
          <Button onClick={handleLogout}>Cerrar Sesión</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mi Perfil de Abogado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Nombre Completo:</strong> {lawyerDetails.full_name}</p>
            <p><strong>Especialidad:</strong> {lawyerDetails.specialty}</p>
            <p><strong>Comuna:</strong> {lawyerDetails.commune}</p>
            <p><strong>Email:</strong> {lawyerDetails.email}</p>
            {lawyerDetails.phone && <p><strong>Teléfono:</strong> {lawyerDetails.phone}</p>}
            <p><strong>Estado:</strong> {lawyerDetails.enabled ? 'Habilitado (Visible públicamente)' : 'Deshabilitado (No visible públicamente)'}</p>
            {/* Add a button to edit profile later */}
          </CardContent>
        </Card>

        <LawyerRequestList lawyerId={lawyerDetails.id} />
      </main>
    </div>
  );
}