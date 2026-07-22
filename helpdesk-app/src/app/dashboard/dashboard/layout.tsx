// src/app/(dashboard)/layout.tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shared/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Persistent Sidebar */}
      <Sidebar user={session} />

      {/* Main Content View Container */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}