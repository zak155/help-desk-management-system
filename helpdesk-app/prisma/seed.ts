import { PrismaClient, Role, Status, Priority, Category } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Helpdesk database seeding...");

  // 1. Clean up existing data
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash common password
  const defaultPassword = await bcrypt.hash("password123", 10);

  // 3. Create Managers (2)
  const manager1 = await prisma.user.create({
    data: {
      email: "manager1@company.com",
      name: "Sarah Jenkins (Manager)",
      password: defaultPassword,
      role: Role.MANAGER,
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: "manager2@company.com",
      name: "David Miller (Manager)",
      password: defaultPassword,
      role: Role.MANAGER,
    },
  });

  // 4. Create Technical Employees (3)
  const tech1 = await prisma.user.create({
    data: {
      email: "tech1@company.com",
      name: "Alex Rivera (Tech Lead)",
      password: defaultPassword,
      role: Role.TECHNICAL,
    },
  });

  const tech2 = await prisma.user.create({
    data: {
      email: "tech2@company.com",
      name: "Michael Chen (SysAdmin)",
      password: defaultPassword,
      role: Role.TECHNICAL,
    },
  });

  const tech3 = await prisma.user.create({
    data: {
      email: "tech3@company.com",
      name: "Emily Watson (IT Support)",
      password: defaultPassword,
      role: Role.TECHNICAL,
    },
  });

  // 5. Create Employees (3)
  const emp1 = await prisma.user.create({
    data: {
      email: "emp1@company.com",
      name: "John Doe (Sales)",
      password: defaultPassword,
      role: Role.EMPLOYEE,
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      email: "emp2@company.com",
      name: "Jane Smith (Marketing)",
      password: defaultPassword,
      role: Role.EMPLOYEE,
    },
  });

  const emp3 = await prisma.user.create({
    data: {
      email: "emp3@company.com",
      name: "Robert Johnson (Finance)",
      password: defaultPassword,
      role: Role.EMPLOYEE,
    },
  });

  console.log("✅ Users created successfully.");

  // 6. Create 10 Seed Tickets with Timeline Logs
  const ticketsData = [
    {
      title: "Monitors flickering on Dual Screen setup",
      description: "My secondary monitor periodically goes black for 2-3 seconds while using Excel.",
      category: Category.IT_SUPPORT,
      priority: Priority.HIGH,
      status: Status.OPEN,
      createdById: emp1.id,
    },
    {
      title: "VPN Authentication connection failing",
      description: "Unable to log into corporate VPN from remote office location.",
      category: Category.IT_SUPPORT,
      priority: Priority.CRITICAL,
      status: Status.ASSIGNED,
      createdById: emp2.id,
      assignedToId: tech1.id,
    },
    {
      title: "AC unit leaking water in 3rd floor conference room",
      description: "Facilities assistance needed urgently before morning executive meeting.",
      category: Category.FACILITIES,
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      createdById: emp3.id,
      assignedToId: tech2.id,
    },
    {
      title: "Request for Figma Professional License key",
      description: "Need approval and license assignment for upcoming UI redesign project.",
      category: Category.OTHER,
      priority: Priority.MEDIUM,
      status: Status.RESOLVED,
      createdById: emp2.id,
      assignedToId: tech3.id,
    },
    {
      title: "Onboarding workstation setup for new HR hire",
      description: "New employee starting next Monday requires laptop, badge, and email access.",
      category: Category.HR,
      priority: Priority.MEDIUM,
      status: Status.CLOSED,
      createdById: emp1.id,
      assignedToId: tech1.id,
    },
    {
      title: "Email sync failing on mobile device",
      description: "Outlook mobile app stopped syncing emails after password change.",
      category: Category.IT_SUPPORT,
      priority: Priority.LOW,
      status: Status.OPEN,
      createdById: emp3.id,
    },
    {
      title: "Printer paper jam in Finance department",
      description: "Main HP printer on floor 2 has a paper jam error that won't clear.",
      category: Category.FACILITIES,
      priority: Priority.LOW,
      status: Status.ASSIGNED,
      createdById: emp3.id,
      assignedToId: tech3.id,
    },
    {
      title: "Database access permission request for Q3 reporting",
      description: "Need read access to reporting database schema for monthly audit.",
      category: Category.IT_SUPPORT,
      priority: Priority.CRITICAL,
      status: Status.IN_PROGRESS,
      createdById: emp1.id,
      assignedToId: tech2.id,
    },
    {
      title: "Ergonomic desk adjustment request",
      description: "Standing desk motorized height control unit is unresponsive.",
      category: Category.FACILITIES,
      priority: Priority.LOW,
      status: Status.RESOLVED,
      createdById: emp2.id,
      assignedToId: tech3.id,
    },
    {
      title: "Payroll portal two-factor authentication reset",
      description: "Lost access to authenticator app after replacing mobile device.",
      category: Category.HR,
      priority: Priority.HIGH,
      status: Status.CLOSED,
      createdById: emp3.id,
      assignedToId: tech1.id,
    },
  ];

  for (const t of ticketsData) {
    const createdTicket = await prisma.ticket.create({ data: t });

    // Seed Activity Timeline entry for each ticket
    await prisma.activityLog.create({
      data: {
        ticketId: createdTicket.id,
        performedById: t.createdById,
        action: "TICKET_CREATED",
        message: `Ticket created with status ${t.status}`,
      },
    });

    if (t.assignedToId) {
      await prisma.activityLog.create({
        data: {
          ticketId: createdTicket.id,
          performedById: manager1.id,
          action: "ASSIGNED",
          message: `Ticket assigned to technician`,
        },
      });
    }
  }

  console.log("✅ Seed tickets and activity logs created successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });