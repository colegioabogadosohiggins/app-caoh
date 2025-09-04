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

const formSchema = z.object({
  full_name: z.string().min(2, { message: "El nombre completo debe tener al menos 2 caracteres." }),
  rut: z.string().min(9, { message: "El RUT debe tener al menos 9 caracteres." }).max(12, { message: "El RUT no puede exceder los 12 caracteres." }),
  commune: z.string().min(2, { message: "La comuna debe tener al menos 2 caracteres." }),
  specialty: z.string().min(2, { message: "La especialidad debe tener al menos 2 caracteres." }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
});

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

interface EditLawyerFormProps {
  lawyer: Lawyer;
  onClose: () => void;
}

export function EditLawyerForm({ lawyer, onClose }: EditLawyerFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: lawyer.full_name,
      rut: lawyer.rut,
      commune: lawyer.commune,
      specialty: lawyer.specialty,
      phone: lawyer.phone || "",
      email: lawyer.email,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Update lawyer details in the 'lawyers' table
      const { error: lawyerError } = await supabase
        .from("lawyers")
        .update({
          full_name: values.full_name,
          rut: values.rut,
          commune: values.commune,
          specialty: values.specialty,
          phone: values.phone || null,
          email: values.email,
        })
        .eq('id', lawyer.id);

      if (lawyerError) {
        console.error("Error updating lawyer details:", lawyerError);
        toast.error(`Error al actualizar los detalles del abogado: ${lawyerError.message}`);
        return;
      }

      // Update user email in auth.users if it changed
      if (values.email !== lawyer.email) {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          lawyer.user_id,
          { email: values.email }
        );

        if (authError) {
          console.error("Error updating user email in auth:", authError);
          toast.error(`Error al actualizar el correo electrónico del usuario: ${authError.message}`);
          // Consider rolling back lawyer details update if auth update fails, or handle this case carefully
          return;
        }
      }

      // Update profile table if first_name or last_name changed
      const newFirstName = values.full_name.split(' ')[0];
      const newLastName = values.full_name.split(' ').slice(1).join(' ');
      
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', lawyer.user_id)
        .single();

      if (profileFetchError) {
        console.error("Error fetching profile for update:", profileFetchError);
        toast.error("Error al obtener el perfil para actualizar.");
        return;
      }

      if (profileData.first_name !== newFirstName || profileData.last_name !== newLastName) {
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({
            first_name: newFirstName,
            last_name: newLastName,
          })
          .eq('id', lawyer.user_id);

        if (profileUpdateError) {
          console.error("Error updating profile name:", profileUpdateError);
          toast.error(`Error al actualizar el nombre en el perfil: ${profileUpdateError.message}`);
          return;
        }
      }


      toast.success("¡Abogado actualizado con éxito!");
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
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Actualizando..." : "Actualizar Abogado"}
        </Button>
      </form>
    </Form>
  );
}