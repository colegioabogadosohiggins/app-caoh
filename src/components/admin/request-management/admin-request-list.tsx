"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminRequestCard } from "./admin-request-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from 'date-fns/locale';

interface Request {
  id: string;
  lawyer_id: string;
  visitor_name: string;
  visitor_email: string;
  message: string;
  status: 'pendiente' | 'cerrado';
  created_at: string;
  lawyers: Array<{ // Changed to Array to match TypeScript's inference
    full_name: string;
    email: string;
  }> | null;
}

export function AdminRequestList() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('requests')
      .select(`
        id,
        lawyer_id,
        visitor_name,
        visitor_email,
        message,
        status,
        created_at,
        lawyers (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      toast.error('Error al cargar la lista de solicitudes.');
      setRequests([]);
    } else {
      // Explicitly cast data to the expected Request[] type
      setRequests(data as Request[] || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRequestUpdate = () => {
    fetchRequests(); // Re-fetch requests after an update
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Abogado</TableHead>
            <TableHead>Visitante</TableHead>
            <TableHead>Email Visitante</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                Cargando solicitudes...
              </TableCell>
            </TableRow>
          ) : requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No hay solicitudes de contacto.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.lawyers?.[0]?.full_name || 'N/A'}</TableCell>
                <TableCell>{request.visitor_name}</TableCell>
                <TableCell>{request.visitor_email}</TableCell>
                <TableCell>{format(new Date(request.created_at), 'dd MMM yyyy HH:mm', { locale: es })}</TableCell>
                <TableCell>
                  <Badge variant={request.status === "pendiente" ? "secondary" : "default"}>
                    {request.status === "pendiente" ? "Pendiente" : "Cerrado"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" /> Ver/Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Detalles de la Solicitud</DialogTitle>
                      </DialogHeader>
                      <AdminRequestCard request={request} onStatusChange={handleRequestUpdate} />
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}