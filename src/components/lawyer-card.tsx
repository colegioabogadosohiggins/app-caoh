"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactLawyerForm } from "@/components/contact-lawyer-form";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Mail, Phone, MapPin, Briefcase } from "lucide-react";

interface Lawyer {
  id: string;
  full_name: string;
  commune: string;
  specialty: string;
  email: string;
  phone?: string;
}

export function LawyerCard({ lawyer }: { lawyer: Lawyer }) {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  return (
    <Card className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">
          {lawyer.full_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-muted-foreground">
          <Briefcase className="mr-2 h-4 w-4" />
          <span>{lawyer.specialty}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4" />
          <span>{lawyer.commune}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Mail className="mr-2 h-4 w-4" />
          <span>{lawyer.email}</span>
        </div>
        {lawyer.phone && (
          <div className="flex items-center text-muted-foreground">
            <Phone className="mr-2 h-4 w-4" />
            <span>{lawyer.phone}</span>
          </div>
        )}
        <Dialog open={isContactFormOpen} onOpenChange={setIsContactFormOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-4">Contactar</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Contactar a {lawyer.full_name}</DialogTitle>
              <DialogDescription>
                Envía un mensaje a este abogado. Él se pondrá en contacto contigo.
              </DialogDescription>
            </DialogHeader>
            <ContactLawyerForm lawyerId={lawyer.id} onClose={() => setIsContactFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}