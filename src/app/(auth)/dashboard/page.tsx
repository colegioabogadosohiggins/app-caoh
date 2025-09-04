"use client";

import { useSession } from "@/components/auth/session-context-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { profile, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && profile) {
      if (profile.role === 'abogado') {
        router.push('/dashboard/lawyer');
      } else if (profile.role === 'admin') {
        router.push('/dashboard/admin');
      }
    }
  }, [profile, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  // Fallback if profile is not loaded or role is unexpected
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirigiendo...</p>
    </div>
  );
}