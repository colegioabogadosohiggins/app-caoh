"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditLawyerDialog } from "./edit-lawyer-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
}

interface LawyerActionsProps {
  lawyer: Lawyer;
  onUpdate: () => void;
}

export function LawyerActions({ lawyer, onUpdate }: LawyerActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleEnabled = async (checked: boolean) => {
    const { error } = await supabase
      .from('lawyers')
      .update({ enabled: checked })
      .eq('id', lawyer.id);

    if (error) {
      console.error('Error toggling lawyer status:', error);
      toast.error('Error al actualizar el estado del abogado.');
    } else {
      toast.success(`Abogado ${checked ? 'habilitado' : 'deshabilitado'} correctamente.`);
      onUpdate();
    }
  };

  const handleDeleteLawyer = async () => {
    setIsDeleting(true);
    // First, delete the user from auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(lawyer.user_id);

    if (authError) {
      console.error('Error deleting user from auth:', authError);
      toast.error('Error al eliminar el usuario de autenticación. Inténtalo de nuevo.');
      setIsDeleting(false);
      return;
    }

    // The RLS policy on `lawyers` table should handle cascading delete if `user_id` is a foreign key with ON DELETE CASCADE.
    // If not, we would explicitly delete from `lawyers` table here.
    // For now, assuming `ON DELETE CASCADE` is set up for `lawyers` and `profiles` tables.

    toast.success('Abogado y usuario eliminados correctamente.');
    onUpdate();
    setIsDeleting(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2">
        <Switch
          id={`enabled-switch-${lawyer.id}`}
          checked={lawyer.enabled}
          onCheckedChange={handleToggleEnabled}
        />
        <Label htmlFor={`enabled-switch-${lawyer.id}`}>
          {lawyer.enabled ? "Habilitado" : "Deshabilitado"}
        </Label>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            Editar
          </DropdownMenuItem>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                Eliminar
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente al abogado, su cuenta de usuario y todos los datos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteLawyer} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditLawyerDialog
        lawyer={lawyer}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onLawyerUpdated={onUpdate}
      />
    </div>
  );
}