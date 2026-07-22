// src/components/tickets/AssignTicketSelect.tsx
"use client";

import { useState, useTransition } from "react";
import { assignTicketAction } from "@/actions/assignment";
import { Button } from "@/components/ui/button";

interface TechUser {
  id: string;
  name: string;
  email: string;
}

interface AssignTicketSelectProps {
  ticketId: string;
  currentAssigneeId?: string | null;
  technicalUsers: TechUser[];
}

export function AssignTicketSelect({
  ticketId,
  currentAssigneeId,
  technicalUsers,
}: AssignTicketSelectProps) {
  const [selectedUserId, setSelectedUserId] = useState(currentAssigneeId || "");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAssign = () => {
    if (!selectedUserId) return;
    setErrorMessage(null);

    startTransition(async () => {
      const result = await assignTicketAction(ticketId, selectedUserId);
      if (result?.error) {
        setErrorMessage(result.error);
      }
    });
  };

  return (
    <div className="space-y-2 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">Assign Technical Staff</h3>
      {errorMessage && (
        <p className="text-xs font-medium text-destructive">{errorMessage}</p>
      )}
      <div className="flex items-center gap-2">
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          disabled={isPending}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        >
          <option value="">-- Select Technical Employee --</option>
          {technicalUsers.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.name} ({tech.email})
            </option>
          ))}
        </select>

        <Button
          onClick={handleAssign}
          disabled={isPending || !selectedUserId || selectedUserId === currentAssigneeId}
          size="sm"
        >
          {isPending ? "Assigning..." : "Assign"}
        </Button>
      </div>
    </div>
  );
}