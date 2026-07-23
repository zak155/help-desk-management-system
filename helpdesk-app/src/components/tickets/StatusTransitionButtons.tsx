// src/components/tickets/StatusTransitionButtons.tsx
"use client";

import { useState, useTransition } from "react";
import { updateTicketStatusAction } from "@/actions/tickets";
import { Button } from "@/components/ui/button";
import { Status } from "@prisma/client";

interface StatusTransitionButtonsProps {
  ticketId: string;
  currentStatus: Status;
  userRole: string;
  isCreator: boolean;
  isAssignee: boolean;
}

export function StatusTransitionButtons({
  ticketId,
  currentStatus,
  userRole,
  isCreator,
  isAssignee,
}: StatusTransitionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = (newStatus: Status) => {
    setError(null);
    startTransition(async () => {
      const res = await updateTicketStatusAction(ticketId, newStatus);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  // Determine available next actions based on current status and user role
  const canStartProgress =
    (userRole === "TECHNICAL" && isAssignee && currentStatus === Status.ASSIGNED) ||
    userRole === "MANAGER";

  const canResolve =
    (userRole === "TECHNICAL" && isAssignee && currentStatus === Status.IN_PROGRESS) ||
    userRole === "MANAGER";

  const canConfirmClose =
    (userRole === "EMPLOYEE" && isCreator && currentStatus === Status.RESOLVED) ||
    userRole === "MANAGER";

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">Workflow Actions</h3>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {currentStatus === Status.ASSIGNED && canStartProgress && (
          <Button
            onClick={() => handleStatusChange(Status.IN_PROGRESS)}
            disabled={isPending}
            size="sm"
          >
            {isPending ? "Updating..." : "Start Working (In Progress)"}
          </Button>
        )}

        {currentStatus === Status.IN_PROGRESS && canResolve && (
          <Button
            onClick={() => handleStatusChange(Status.RESOLVED)}
            disabled={isPending}
            variant="default"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isPending ? "Updating..." : "Mark as Resolved"}
          </Button>
        )}

        {currentStatus === Status.RESOLVED && canConfirmClose && (
          <Button
            onClick={() => handleStatusChange(Status.CLOSED)}
            disabled={isPending}
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? "Updating..." : "Confirm Resolution & Close Ticket"}
          </Button>
        )}

        {currentStatus === Status.CLOSED && (
          <p className="text-sm text-muted-foreground italic">
            This ticket is closed and resolved.
          </p>
        )}
      </div>
    </div>
  );
}