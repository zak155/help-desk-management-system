import Image from "next/image";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold tracking-tight">
        Helpdesk Management System
      </h1>
      <p className="mt-4 text-muted-foreground">
        Phase 1 initialized successfully.
      </p>
    </main>
  );
}
