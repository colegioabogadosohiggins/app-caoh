"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { LawyerCard } from "@/components/lawyer-card";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { toast } from "sonner";

interface Lawyer {
  id: string;
  full_name: string;
  commune: string;
  specialty: string;
  email: string;
  phone?: string;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLawyers = async () => {
      setLoading(true);
      let query = supabase
        .from("lawyers")
        .select("id, full_name, commune, specialty, email, phone")
        .eq("enabled", true); // Only show enabled lawyers

      if (searchTerm) {
        query = query.or(
          `full_name.ilike.%${searchTerm}%,commune.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching lawyers:", error);
        toast.error("Error al cargar los abogados.");
        setLawyers([]);
      } else {
        setLawyers(data || []);
      }
      setLoading(false);
    };

    fetchLawyers();
  }, [searchTerm]);

  return (
    <div className="flex flex-col items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background text-foreground">
      <main className="flex flex-col gap-8 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-6">
          Buscador de Abogados de O’Higgins
        </h1>

        <div className="w-full mb-8">
          <Input
            type="text"
            placeholder="Buscar por nombre, comuna o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border rounded-md shadow-sm focus:ring-primary focus:border-primary"
          />
        </div>

        {loading ? (
          <p className="text-center">Cargando abogados...</p>
        ) : lawyers.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No se encontraron abogados que coincidan con tu búsqueda.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.map((lawyer) => (
              <LawyerCard key={lawyer.id} lawyer={lawyer} />
            ))}
          </div>
        )}
      </main>
      <MadeWithDyad />
    </div>
  );
}