// src/actions/auth.ts
"use server";

import { prisma } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(data: LoginInput) {
  // 1. Validate inputs server-side
  const validated = loginSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { email, password } = validated.data;

  // 2. Query user from PostgreSQL via Prisma
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "Invalid email or password." };
  }

  // 3. Compare password hash
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { error: "Invalid email or password." };
  }

  // 4. Create HTTP-only JWT Cookie session
  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  redirect("/dashboard");
}

export async function registerAction(data: RegisterInput) {
  const validated = registerSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { email, password, name, role } = validated.data;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create User
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
  });

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}