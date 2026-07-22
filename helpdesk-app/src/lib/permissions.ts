// src/lib/permissions.ts
import { getSession, SessionPayload } from "@/lib/session";
import { Role, Status } from "@prisma/client";

/**
 * Asserts that a valid session exists. Throws an error or returns session payload.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: You must be logged in to perform this action.");
  }
  return session;
}

/**
 * Asserts that the logged in user has one of the allowed roles.
 */
export async function requireRole(allowedRoles: Role[]): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role as Role)) {
    throw new Error("FORBIDDEN: You do not have permission to perform this action.");
  }
  return session;
}

/**
 * Validates whether a given user can transition a ticket to a new status based on business rules.
 */
export function canTransitionStatus(
  userRole: Role,
  isCreator: boolean,
  isAssignee: boolean,
  currentStatus: Status,
  newStatus: Status
): boolean {
  // Managers can perform any valid status transition
  if (userRole === Role.MANAGER) {
    return true;
  }

  // Employee Workflow: Can only confirm resolution (Resolved -> Closed) on their own ticket
  if (userRole === Role.EMPLOYEE) {
    if (isCreator && currentStatus === Status.RESOLVED && newStatus === Status.CLOSED) {
      return true;
    }
    return false;
  }

  // Technical Staff Workflow: Assigned -> In Progress -> Resolved (for tickets assigned to them)
  if (userRole === Role.TECHNICAL && isAssignee) {
    if (currentStatus === Status.ASSIGNED && newStatus === Status.IN_PROGRESS) return true;
    if (currentStatus === Status.IN_PROGRESS && newStatus === Status.RESOLVED) return true;
  }

  return false;
}