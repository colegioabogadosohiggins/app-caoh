"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, User, MessageSquare, Calendar, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

interface AdminRequestCardProps {
  request: Request;
  onStatusChange: () => void; // Callback to refresh the list after a status change
}

export function AdminRequestCard({ request, onStatusChange }: AdminRequestCardProps) {
  const [currentStatus, setCurrentStatus] = useState(request.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: 'pendiente' | 'cerrado') => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', request.id);

    if (error) {
      console.error('Error updating request status:', error);
      toast.error('Error al actualizar el estado de la solicitud.');
    } else {
      setCurrentStatus(newStatus);
      toast.success('Estado de la solicitud actualizado.');
      onStatusChange(); // Refresh the list
    }
    setIsUpdating(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center text-sm text-muted-foreground">
        <Briefcase className="mr-2 h-4 w-4" />
        <span>Abogado: {request.lawyers?.[0]?.full_name || 'N/A'} ({request.lawyers?.[0]?.email || 'N/A'})</span>
      </div>
      <div className="flex items-center text-sm text-foreground">
        <User className="mr-2 h-4 w-4" />
        <span>Visitante: {request.visitor_name}</span>
      </div>
      <div className="flex items-center text-sm text-foreground">
        <Mail className="mr-2 h-4 w-4" />
        <span>Email: {request.visitor_email}</span>
      </div>
      <div className="flex items-start text-sm text-foreground">
        <MessageSquare className="mr-2 h-4 w-4 mt-1" />
        <p className="flex-1">Mensaje: {request.message}</p>
      </div>
      <div className="flex items-center text-sm text-muted-foreground">
        <Calendar className="mr-2 h-4 w-4" />
        <span>Fecha de Solicitud: {format(new Date(request.created_at), 'dd MMMM yyyy HH:mm', { locale: es })}</span>
      </div>
      <div className="flex items-center justify-between pt-2">
        <span className="text-sm font-medium">Estado:</span>
        <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isUpdating}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Cambiar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="cerrado">Cerrado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}