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
import { LawyerActions } from "@/components/admin/lawyer-management/lawyer-actions";

interface Lawyer {
  id: string;
  user_id: string;
  full_name: string;
  rut: string;
  commune: string;
  specialty: string;
  phone?: string;
  email: string;
  enabled: boolean;
  created_at: string;
}

export function LawyerList() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLawyers = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('lawyers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lawyers:', error);
      toast.error('Error al cargar la lista de abogados.');
      setLawyers([]);
    } else {
      setLawyers(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLawyers();
  }, [fetchLawyers]);

  const handleLawyerUpdate = () => {
    fetchLawyers(); // Re-fetch lawyers after an update/delete
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>RUT</TableHead>
            <TableHead>Comuna</TableHead>
            <TableHead>Especialidad</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                Cargando abogados...
              </TableCell>
            </TableRow>
          ) : lawyers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No hay abogados registrados.
              </TableCell>
            </TableRow>
          ) : (
            lawyers.map((lawyer) => (
              <TableRow key={lawyer.id}>
                <TableCell className="font-medium">{lawyer.full_name}</TableCell>
                <TableCell>{lawyer.rut}</TableCell>
                <TableCell>{lawyer.commune}</TableCell>
                <TableCell>{lawyer.specialty}</TableCell>
                <TableCell>{lawyer.email}</TableCell>
                <TableCell>{lawyer.phone || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={lawyer.enabled ? "default" : "destructive"}>
                    {lawyer.enabled ? "Habilitado" : "Deshabilitado"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <LawyerActions lawyer={lawyer} onUpdate={handleLawyerUpdate} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}