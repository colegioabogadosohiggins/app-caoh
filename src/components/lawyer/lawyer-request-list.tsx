"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LawyerRequestCard } from "@/components/lawyer/lawyer-request-card";

interface Request {
  id: string;
  visitor_name: string;
  visitor_email: string;
  message: string;
  status: 'pendiente' | 'cerrado';
  created_at: string;
}

interface LawyerRequestListProps {
  lawyerId: string;
}

export function LawyerRequestList({ lawyerId }: LawyerRequestListProps) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('lawyer_id', lawyerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      toast.error('Error al cargar las solicitudes.');
      setRequests([]);
    } else {
      setRequests(data || []);
    }
    setIsLoading(false);
  }, [lawyerId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Solicitudes de Contacto</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center">Cargando solicitudes...</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No tienes solicitudes de contacto pendientes.
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <LawyerRequestCard key={request.id} request={request} onStatusChange={fetchRequests} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}