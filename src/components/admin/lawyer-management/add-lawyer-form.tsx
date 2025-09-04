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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  full_name: z.string().min(2, { message: "El nombre completo debe tener al menos 2 caracteres." }),
  rut: z.string().min(9, { message: "El RUT debe tener al menos 9 caracteres." }).max(12, { message: "El RUT no puede exceder los 12 caracteres." }),
  commune: z.string().min(2, { message: "La comuna debe tener al menos 2 caracteres." }),
  specialty: z.string().min(2, { message: "La especialidad debe tener al menos 2 caracteres." }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

interface AddLawyerFormProps {
  onClose: () => void;
}

export function AddLawyerForm({ onClose }: AddLawyerFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      rut: "",
      commune: "",
      specialty: "",
      phone: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: values.email,
        password: values.password,
        email_confirm: true, // Automatically confirm email for admin-created users
        user_metadata: {
          first_name: values.full_name.split(' ')[0], // Simple split for first name
          last_name: values.full_name.split(' ').slice(1).join(' '), // Rest for last name
          role: 'abogado', // Assign 'abogado' role
        },
      });

      if (authError) {
        console.error("Error creating user:", authError);
        toast.error(`Error al crear el usuario: ${authError.message}`);
        return;
      }

      const userId = authData.user?.id;

      if (!userId) {
        toast.error("Error: No se pudo obtener el ID del usuario creado.");
        return;
      }

      // 2. Insert lawyer details into the 'lawyers' table
      const { error: lawyerError } = await supabase
        .from("lawyers")
        .insert({
          user_id: userId,
          full_name: values.full_name,
          rut: values.rut,
          commune: values.commune,
          specialty: values.specialty,
          phone: values.phone || null,
          email: values.email,
          enabled: true, // New lawyers are enabled by default
        });

      if (lawyerError) {
        console.error("Error inserting lawyer details:", lawyerError);
        // If lawyer details insertion fails, consider deleting the auth user to prevent orphaned accounts
        await supabase.auth.admin.deleteUser(userId);
        toast.error(`Error al guardar los detalles del abogado: ${lawyerError.message}. El usuario de autenticación ha sido eliminado.`);
        return;
      }

      toast.success("¡Abogado añadido con éxito!");
      form.reset();
      onClose();
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
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RUT</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 12.345.678-9" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="commune"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comuna</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Rancagua" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specialty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidad</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Derecho Civil" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: +56912345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input type="email" placeholder="ejemplo@correo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Contraseña segura" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Añadiendo..." : "Añadir Abogado"}
        </Button>
      </form>
    </Form>
  );
}