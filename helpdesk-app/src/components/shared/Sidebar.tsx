// src/components/shared/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { SessionPayload } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SidebarProps {
  user: SessionPayload;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "All Tickets", href: "/tickets", icon: "🎟️" },
  ];

  if (user.role === "EMPLOYEE" || user.role === "MANAGER") {
    navItems.push({ label: "Create Ticket", href: "/tickets/new", icon: "➕" });
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "MANAGER":
        return "destructive";
      case "TECHNICAL":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <aside className="w-64 border-r bg-card min-h-screen flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            H
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight">Helpdesk OS</h2>
            <p className="text-xs text-muted-foreground">Ticketing System</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Settings Section */}
      <div className="border-t pt-4 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar>
            <AvatarFallback className="font-bold">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate">{user.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            <div className="mt-1">
              <Badge variant={getRoleBadgeVariant(user.role)} className="text-[10px] px-1.5 py-0">
                {user.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Logout Action */}
        <form action={logoutAction}>
          <Button variant="outline" size="sm" className="w-full text-xs">
            Log Out
          </Button>
        </form>
      </div>
    </aside>
  );
}