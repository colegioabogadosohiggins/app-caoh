"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, FileText } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard/admin/lawyers",
      icon: Users,
      label: "Abogados",
    },
    {
      href: "/dashboard/admin/requests",
      icon: FileText,
      label: "Solicitudes",
    },
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r p-4 flex flex-col">
      <div className="text-2xl font-bold mb-8 text-sidebar-primary">CAO'H Admin</div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              pathname.startsWith(item.href)
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}