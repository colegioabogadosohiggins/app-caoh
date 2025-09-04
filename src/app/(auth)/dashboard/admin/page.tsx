"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/auth/session-context-provider";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { profile, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && profile?.role === 'admin') {
      router.replace('/dashboard/admin/lawyers');
    }
  }, [profile, isLoading, router]);

  if (isLoading || profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando panel de administrador...</p>
      </div>
    );
  }

  return null; // Will be redirected
}