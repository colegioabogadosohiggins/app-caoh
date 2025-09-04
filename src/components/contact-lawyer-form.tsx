"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  visitor_name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  visitor_email: z.string().email({
    message: "Por favor, introduce un correo electrónico válido.",
  }),
  message: z.string().min(10, {
    message: "El mensaje debe tener al menos 10 caracteres.",
  }).max(500, {
    message: "El mensaje no puede exceder los 500 caracteres.",
  }),
});

interface ContactLawyerFormProps {
  lawyerId: string;
  onClose: () => void;
}

export function ContactLawyerForm({ lawyerId, onClose }: ContactLawyerFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitor_name: "",
      visitor_email: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data, error } = await supabase
        .from("requests")
        .insert({
          lawyer_id: lawyerId,
          visitor_name: values.visitor_name,
          visitor_email: values.visitor_email,
          message: values.message,
          status: "pendiente",
        });

      if (error) {
        console.error("Error submitting contact request:", error);
        toast.error("Error al enviar la solicitud. Por favor, inténtalo de nuevo.");
      } else {
        toast.success("¡Solicitud enviada con éxito! El abogado se pondrá en contacto contigo pronto.");
        form.reset();
        onClose();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="visitor_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tu Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="visitor_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tu Correo Electrónico</FormLabel>
              <FormControl>
                <Input type="email" placeholder="tu@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tu Mensaje</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escribe tu mensaje aquí..."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Enviando..." : "Enviar Solicitud"}
        </Button>
      </form>
    </Form>
  );
}