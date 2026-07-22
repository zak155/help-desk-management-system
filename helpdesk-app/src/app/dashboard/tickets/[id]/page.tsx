// src/app/(dashboard)/tickets/[id]/page.tsx
import { prisma } from "@/lib/db";
import { formatTicketId } from "@/lib/format";
import { getSession } from "@/lib/session";
import { Role } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AssignTicketSelect } from "@/components/tickets/AssignTicketSelect";
import { StatusTransitionButtons } from "@/components/tickets/StatusTransitionButtons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: PageProps) {
  // Handle Async params in Next.js 15
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch ticket details with relations and activity logs
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      activityLogs: {
        include: { performedBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ticket) notFound();

  // Role Access Enforcement
  const isManager = session.role === Role.MANAGER;
  const isCreator = ticket.createdById === session.userId;
  const isAssignee = ticket.assignedToId === session.userId;

  if (!isManager && !isCreator && !isAssignee) {
    redirect("/tickets");
  }

  // Fetch technical staff list if current user is Manager (for assignment dropdown)
  const technicalUsers = isManager
    ? await prisma.user.findMany({
        where: { role: Role.TECHNICAL },
        select: { id: true, name: true, email: true },
      })
    : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-bold text-muted-foreground">
              {formatTicketId(ticket.ticketNumber)}
            </span>
            <Badge>{ticket.status}</Badge>
            <Badge variant="outline">{ticket.priority} Priority</Badge>
          </div>
          <h1 className="text-2xl font-bold mt-2">{ticket.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card p-6 space-y-3">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {ticket.description}
            </p>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Activity Timeline</h2>
            <div className="space-y-4">
              {ticket.activityLogs.map((log) => (
                <div key={log.id} className="flex flex-col border-l-2 border-primary/30 pl-4 py-1">
                  <span className="text-sm font-medium">{log.message}</span>
                  <span className="text-xs text-muted-foreground">
                    by {log.performedBy.name} • {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Controls (1 Col) */}
        <div className="space-y-6">
          {/* Manager Assignment Control */}
          {isManager && (
            <AssignTicketSelect
              ticketId={ticket.id}
              currentAssigneeId={ticket.assignedToId}
              technicalUsers={technicalUsers}
            />
          )}

          {/* Workflow Status Actions */}
          <StatusTransitionButtons
            ticketId={ticket.id}
            currentStatus={ticket.status}
            userRole={session.role}
            isCreator={isCreator}
            isAssignee={isAssignee}
          />

          {/* Ticket Metadata Card */}
          <div className="rounded-lg border bg-card p-4 space-y-3 text-sm">
            <h3 className="font-semibold text-foreground">Ticket Info</h3>
            <div>
              <span className="text-muted-foreground">Created By:</span>{" "}
              <span className="font-medium">{ticket.createdBy.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Assigned To:</span>{" "}
              <span className="font-medium">
                {ticket.assignedTo?.name || "Unassigned"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Category:</span>{" "}
              <span className="font-medium">{ticket.category}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Created Date:</span>{" "}
              <span className="font-medium">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}