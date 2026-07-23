# 🎫 Helpdesk  — Role-Based IT Ticketing System

A full-stack, enterprise-grade IT Helpdesk application built with Next.js 16 (App Router & Turbopack), Server Actions, Prisma 7 ORM, PostgreSQL, and Tailwind CSS / shadcn/ui.

---

## 🌟 Key Features

* **Authentication & Authorization**: Secure JWT session handling with Role-Based Access Control (RBAC).
* **3 Distinct User Roles**:
  * **EMPLOYEE**: Submit tickets, view submitted tickets status, and confirm resolution to close tickets.
  * **TECHNICAL**: View assigned ticket queues, start progress (`IN_PROGRESS`), and resolve tickets (`RESOLVED`).
  * **MANAGER**: Global system overview, workload distribution, and ability to override any ticket status.
* **Interactive Ticket Lifecycle Workflow**: State transitions enforced strictly via Server Actions:  
  `OPEN` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `CLOSED`
* **Real-time Activity Logs**: Full audit trail tracking every ticket creation and status update.

---

## 🖼️ Application Screenshots


| Dashboard Overview | Ticket Workflow & Details |
| :---: | :---: |
| ![Dashboard Overview](./public/screenshots/dashboard.PNG) | ![Ticket Details](./public/screenshots/employee-dashboard.PNG) |

| Create New Ticket | Ticket Queue |
| :---: | :---: |
| ![Create Ticket](./public/screenshots/login.PNG) | ![Tickets Queue](./public/screenshots/manager-dashboard.png) |

---

## 📁 Project Folder Structure

```text
helpdesk-app/
├── prisma/
│   ├── schema.prisma            # Database schemas & models
│   └── seed.ts                  # Seed script with demo users & tickets
├── public/
│   └── screenshots/             # Screenshots for documentation
│       ├── dashboard.png
│       ├── ticket-detail.png
│       ├── create-ticket.png
│       └── tickets-queue.png
├── src/
│   ├── actions/                 # Next.js Server Actions
│   │   ├── auth.ts              # Authentication & Session logic
│   │   └── tickets.ts           # Ticket CRUD & status mutation logic
│   ├── app/                     # App Router Pages & Routes
│   │   ├── (auth)/              # Authentication route group (login, register)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/         # Protected route group
│   │   │   ├── dashboard/       # Main dashboard metrics
│   │   │   ├── tickets/         # Ticket list & detail pages
│   │   │   │   ├── [id]/
│   │   │   │   └── new/
│   │   │   └── layout.tsx       # Main dashboard layout (Sidebar)
│   │   ├── layout.tsx           # Root application layout
│   │   └── page.tsx             # Root redirect route
│   ├── components/
│   │   ├── shared/              # Reusable layout components (Sidebar)
│   │   ├── tickets/             # Domain-specific ticket components
│   │   └── ui/                  # UI design components (Button, Card, Input)
│   ├── generated/               # Generated Prisma Client outputs
│   ├── lib/                     # Utilities & DB client configuration
│   │   ├── db.ts                # Prisma client instantiation with driver adapter
│   │   ├── session.ts           # Session token encryption & verification
│   │   └── utils.ts             # Helper functions (cn utility)
│   └── proxy.ts                 # Next.js route protection & proxy middleware
├── .env                         # Environment variables (DATABASE_URL, JWT_SECRET)
├── next.config.ts               # Next.js configuration
├── package.json                 # Project dependencies & scripts
└── prisma.config.ts             # Prisma 7 CLI configuration
```

---

## 🛠️ Core Tech Stack & Dependencies

### Framework & Frontend
* **Next.js 16** — App Router, Server Actions, Turbopack
* **React 19** — UI Library
* **Tailwind CSS** — Utility-first styling
* **Radix UI / Slot** — Accessible UI primitives
* **Lucide React** — Icon library

### Backend & Database
* **Prisma 7** — ORM & Migrations
* **@prisma/adapter-pg** — Native driver adapter
* **PostgreSQL** — Relational database
* **bcryptjs** — Password hashing
* **jose** — JWT verification for session management

---

## 🚀 Getting Started Locally

### 1. Prerequisites
* **Node.js**: v20 or higher
* **PostgreSQL**: Instance running locally or via cloud (e.g., Supabase / Neon)

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/helpdesk_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV="development"
```

### 3. Installation

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with demo users & data
npx prisma db seed
```

### 4. Running Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials (From Seed)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Manager** | `manager1@company.com` | `password123` |
| **Technical Staff** | `tech1@company.com` | `password123` |
| **Employee** | `emp1@company.com` | `password123` |

---

## 📦 Production Build

To build and verify production readiness:

```bash
# Create production build
npm run build

# Start production server
npm start
```