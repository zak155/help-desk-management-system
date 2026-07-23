# Helpdesk Management System

A full-stack, role-based ticketing system built with Next.js 15 (App Router), TypeScript, Prisma ORM, and PostgreSQL.

## Features

- **Role-Based Access Control (RBAC):** Distinct workflows and dashboards for **Managers**, **Technical Staff**, and **Employees**.
- **Ticket Workflow State Machine:** Status transitions enforced via server-side checks (`OPEN` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`).
- **Activity Timeline & Comments:** Real-time discussion thread and automatic audit trail logging for every assignment or status change.
- **Server Actions Architecture:** Zero API routes (`/api/*`), utilizing Next.js Server Actions for type-safe database mutations.
- **Secure Authentication:** JWT signed via `jose` and stored in HTTP-only, SameSite cookies.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components, Server Actions)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Form Handling & Validation:** React Hook Form & Zod
- **Authentication:** JWT in HTTP-Only Cookies (`jose`, `bcryptjs`)
- **Styling:** TailwindCSS & shadcn/ui

---

## Preseeded User Credentials

The database comes pre-populated with default test accounts (password for all accounts is `password123`):

| Role | Email | Password |
| :--- | :--- | :--- |
| **Manager** | `manager1@company.com` | `password123` |
| **Manager** | `manager2@company.com` | `password123` |
| **Technical Staff** | `tech1@company.com` | `password123` |
| **Technical Staff** | `tech2@company.com` | `password123` |
| **Technical Staff** | `tech3@company.com` | `password123` |
| **Employee** | `emp1@company.com` | `password123` |
| **Employee** | `emp2@company.com` | `password123` |
| **Employee** | `emp3@company.com` | `password123` |

---

## Local Setup Instructions

### 1. Clone the repository & Install Dependencies

```bash
git clone <your-repo-url>
cd helpdesk-app
npm install