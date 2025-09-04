"use client";

import { Button } from "@/components/ui/button";
import { LawyerList } from "@/components/admin/lawyer-management/lawyer-list";
import { AddLawyerDialog } from "@/components/admin/lawyer-management/add-lawyer-dialog";
import { useState } from "react";

export default function AdminLawyersPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLawyerAdded = () => {
    setRefreshKey(prev => prev + 1); // Increment key to force re-fetch in LawyerList
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gestión de Abogados</h2>
        <AddLawyerDialog onLawyerAdded={handleLawyerAdded} />
      </div>
      <LawyerList key={refreshKey} />
    </div>
  );
}