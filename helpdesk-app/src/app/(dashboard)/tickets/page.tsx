// src/app/(dashboard)/tickets/page.tsx
import { prisma } from "@/lib/db";
import { formatTicketId } from "@/lib/format";
import { getSession } from "@/lib/session";
import { Role } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function TicketsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Role-Based Data Filtering (Enterprise pattern made simple)
  let whereClause = {};

  if (session.role === Role.EMPLOYEE) {
    whereClause = { createdById: session.userId };
  } else if (session.role === Role.TECHNICAL) {
    whereClause = { assignedToId: session.userId };
  }
  // MANAGERS see all tickets (whereClause remains empty {})

  const tickets = await prisma.ticket.findMany({
    where: whereClause,
    include: {
      createdBy: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Helpdesk Tickets</h1>
          <p className="text-muted-foreground">Manage and track service requests</p>
        </div>
        {session.role !== Role.TECHNICAL && (
          <Button asChild>
            <Link href="/tickets/new">+ Create New Ticket</Link>
          </Button>
        )}
      </div>

      <div className="rounded-md border bg-card">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 text-left font-medium">
                <th className="h-12 px-4">Ticket ID</th>
                <th className="h-12 px-4">Title</th>
                <th className="h-12 px-4">Category</th>
                <th className="h-12 px-4">Priority</th>
                <th className="h-12 px-4">Status</th>
                <th className="h-12 px-4">Created By</th>
                <th className="h-12 px-4">Assigned To</th>
                <th className="h-12 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-muted-foreground">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 font-mono font-bold">
                      {formatTicketId(ticket.ticketNumber)}
                    </td>
                    <td className="p-4 font-medium">{ticket.title}</td>
                    <td className="p-4">{ticket.category}</td>
                    <td className="p-4">
                      <Badge variant="outline">{ticket.priority}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge>{ticket.status}</Badge>
                    </td>
                    <td className="p-4">{ticket.createdBy.name}</td>
                    <td className="p-4">{ticket.assignedTo?.name || "Unassigned"}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/tickets/${ticket.id}`}>View Details</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}