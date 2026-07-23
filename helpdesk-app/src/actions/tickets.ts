// src/actions/tickets.ts
"use server";

import { prisma } from "@/lib/db";
import { requireAuth, requireRole, canTransitionStatus } from "@/lib/permissions";
import { createTicketSchema, CreateTicketInput } from "@/lib/validations/ticket";
import { Role, Status } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Server Action: Create a new Ticket
 */
export async function createTicketAction(data: CreateTicketInput) {
  const session = await requireAuth();

  // Validate form data
  const validated = createTicketSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { title, description, category, priority } = validated.data;

  // Create Ticket & initial Activity Log in a Prisma transaction
  const ticket = await prisma.$transaction(
  async (tx) => {
    const newTicket = await tx.ticket.create({
      data: {
        title,
        description,
        category,
        priority,
        createdById: session.userId,
      },
    });

    await tx.activityLog.create({
      data: {
        ticketId: newTicket.id,
        performedById: session.userId,
        action: "TICKET_CREATED",
        message: `Ticket created with priority ${priority}`,
      },
    });

    return newTicket;
  },
  {
    maxWait: 10000, // Wait up to 10s to acquire a connection
    timeout: 20000, // Allow up to 20s for the transaction to complete
  }
);

  revalidatePath("/tickets");
  redirect(`/tickets/${ticket.id}`);
}

/**
 * Server Action: Transition Ticket Status
 */
export async function updateTicketStatusAction(ticketId: string, newStatus: Status) {
  const session = await requireAuth();

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return { error: "Ticket not found." };
  }

  const isCreator = ticket.createdById === session.userId;
  const isAssignee = ticket.assignedToId === session.userId;

  // Check RBAC permission for this state transition
  const isAllowed = canTransitionStatus(
    session.role as Role,
    isCreator,
    isAssignee,
    ticket.status,
    newStatus
  );

  if (!isAllowed) {
    return { error: "You are not authorized to make this status transition." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: ticketId },
      data: { status: newStatus },
    });

    await tx.activityLog.create({
      data: {
        ticketId,
        performedById: session.userId,
        action: "STATUS_CHANGE",
        message: `Status updated from ${ticket.status} to ${newStatus}`,
      },
    });
  });

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
  return { success: true };
}