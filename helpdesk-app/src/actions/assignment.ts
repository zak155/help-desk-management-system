// src/actions/assignment.ts
"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { assignTicketSchema } from "@/lib/validations/ticket";
import { Role, Status } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Assign or re-assign a ticket to a Technical Employee (MANAGER ONLY)
 */
export async function assignTicketAction(ticketId: string, assignedToId: string) {
  // 1. Enforce Manager Role on the Server
  const session = await requireRole([Role.MANAGER]);

  // 2. Validate inputs
  const validated = assignTicketSchema.safeParse({ ticketId, assignedToId });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  // 3. Verify target assignee is actually a Technical employee
  const techUser = await prisma.user.findFirst({
    where: { id: assignedToId, role: Role.TECHNICAL },
  });

  if (!techUser) {
    return { error: "Selected user is not a valid Technical Employee." };
  }

  // 4. Execute atomic assignment transaction
  try {
    await prisma.$transaction(async (tx) => {
      // Find current ticket state
      const ticket = await tx.ticket.findUnique({
        where: { id: ticketId },
        select: { status: true },
      });

      if (!ticket) throw new Error("Ticket not found.");

      // If status is OPEN, automatically advance to ASSIGNED
      const newStatus = ticket.status === Status.OPEN ? Status.ASSIGNED : ticket.status;

      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          assignedToId,
          status: newStatus,
        },
      });

      await tx.activityLog.create({
        data: {
          ticketId,
          performedById: session.userId,
          action: "ASSIGNED",
          message: `Assigned ticket to ${techUser.name} (${techUser.email})`,
        },
      });
    });

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath("/tickets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to assign ticket." };
  }
}