// src/app/(dashboard)/dashboard/page.tsx
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { Role, Status } from "@prisma/client";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch Role-Specific Dashboard Metrics
  let totalTickets = 0;
  let openTickets = 0;
  let inProgressTickets = 0;
  let resolvedTickets = 0;

  if (session.role === Role.MANAGER) {
    totalTickets = await prisma.ticket.count();
    openTickets = await prisma.ticket.count({ where: { status: Status.OPEN } });
    inProgressTickets = await prisma.ticket.count({
      where: { status: Status.IN_PROGRESS },
    });
    resolvedTickets = await prisma.ticket.count({
      where: { status: Status.RESOLVED },
    });
  } else if (session.role === Role.TECHNICAL) {
    totalTickets = await prisma.ticket.count({
      where: { assignedToId: session.userId },
    });
    openTickets = await prisma.ticket.count({
      where: { assignedToId: session.userId, status: Status.ASSIGNED },
    });
    inProgressTickets = await prisma.ticket.count({
      where: { assignedToId: session.userId, status: Status.IN_PROGRESS },
    });
    resolvedTickets = await prisma.ticket.count({
      where: { assignedToId: session.userId, status: Status.RESOLVED },
    });
  } else {
    // EMPLOYEE
    totalTickets = await prisma.ticket.count({
      where: { createdById: session.userId },
    });
    openTickets = await prisma.ticket.count({
      where: { createdById: session.userId, status: Status.OPEN },
    });
    inProgressTickets = await prisma.ticket.count({
      where: { createdById: session.userId, status: Status.IN_PROGRESS },
    });
    resolvedTickets = await prisma.ticket.count({
      where: { createdById: session.userId, status: Status.RESOLVED },
    });
  }

  // Fetch recent tickets list
  const recentTickets = await prisma.ticket.findMany({
    where:
      session.role === Role.EMPLOYEE
        ? { createdById: session.userId }
        : session.role === Role.TECHNICAL
        ? { assignedToId: session.userId }
        : {},
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } } },
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          {session.role === Role.MANAGER && "Manager Overview: Full System Workload"}
          {session.role === Role.TECHNICAL && "Technical Workspace: Assigned Queue"}
          {session.role === Role.EMPLOYEE && "Employee Portal: My Submitted Issues"}
        </p>
      </div>

      {/* Quick Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {session.role === Role.TECHNICAL ? "Pending / Assigned" : "Open Queue"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{openTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{inProgressTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awaiting Action / Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{resolvedTickets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Overview Table */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/tickets">View All</Link>
          </Button>
        </div>

        <div className="divide-y">
          {recentTickets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No recent activity.
            </p>
          ) : (
            recentTickets.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between">
                <div>
                  <Link href={`/tickets/${t.id}`} className="font-medium hover:underline">
                    {t.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    By {t.createdBy.name} • {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge>{t.status}</Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}