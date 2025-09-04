"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { AddLawyerForm } from "./add-lawyer-form";

interface AddLawyerDialogProps {
  onLawyerAdded: () => void;
}

export function AddLawyerDialog({ onLawyerAdded }: AddLawyerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    onLawyerAdded();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Abogado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Abogado</DialogTitle>
          <DialogDescription>
            Rellena los datos para registrar un nuevo abogado en el sistema.
          </DialogDescription>
        </DialogHeader>
        <AddLawyerForm onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
}