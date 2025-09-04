"use client";

import { AdminRequestList } from "@/components/admin/request-management/admin-request-list";

export default function AdminRequestsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Gestión de Solicitudes de Contacto</h2>
      <AdminRequestList />
    </div>
  );
}