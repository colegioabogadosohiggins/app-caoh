"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditLawyerForm } from "./edit-lawyer-form";

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

interface EditLawyerDialogProps {
  lawyer: Lawyer;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLawyerUpdated: () => void;
}

export function EditLawyerDialog({ lawyer, isOpen, onOpenChange, onLawyerUpdated }: EditLawyerDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
    onLawyerUpdated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Abogado</DialogTitle>
          <DialogDescription>
            Actualiza los datos del abogado.
          </DialogDescription>
        </DialogHeader>
        <EditLawyerForm lawyer={lawyer} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
}