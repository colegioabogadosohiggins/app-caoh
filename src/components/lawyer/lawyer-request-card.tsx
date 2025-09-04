"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, User, MessageSquare, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from 'date-fns/locale';

interface Request {
  id: string;
  visitor_name: string;
  visitor_email: string;
  message: string;
  status: 'pendiente' | 'cerrado';
  created_at: string;
}

interface LawyerRequestCardProps {
  request: Request;
  onStatusChange: () => void; // Callback to refresh the list after a status change
}

export function LawyerRequestCard({ request, onStatusChange }: LawyerRequestCardProps) {
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
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <User className="mr-2 h-5 w-5 text-primary" />
          {request.visitor_name}
        </CardTitle>
        <CardDescription className="flex items-center">
          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
          {request.visitor_email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start text-sm text-foreground">
          <MessageSquare className="mr-2 h-4 w-4 mt-1 text-muted-foreground" />
          <p className="flex-1">{request.message}</p>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          <span>{format(new Date(request.created_at), 'dd MMMM yyyy HH:mm', { locale: es })}</span>
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
      </CardContent>
    </Card>
  );
}