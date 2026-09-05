import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Boxes,
  LayoutDashboard,
  TicketCheck,
  Tickets,
  Users,
} from "lucide-react";

import { auth } from "@/auth";

import AppNav from "@/components/shared/appNav";
import { Button } from "@/components/ui/button";
import { signOutUser } from "@/lib/actions/user.actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  return (
    <div className="flex min-h-svh flex-col bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="mr-8 flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <TicketCheck className="size-4" aria-hidden="true" />
            </span>

            <span className="hidden text-sm font-semibold tracking-tight sm:block">
              Ticket System
            </span>
          </Link>

          {/* Navigation */}
          <AppNav role={role} />
          {/* User */}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{session.user.name}</p>

              <p className="text-xs text-muted-foreground">
                {formatRole(role)}
              </p>
            </div>
            <Button onClick={signOutUser} variant="default" className="ml-5">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>

      <footer className="border-t bg-background">
        <div className="mx-auto flex min-h-12 w-full max-w-7xl items-center justify-center px-4 text-xs text-muted-foreground sm:px-6">
          Ticket System · Internal IT Service Workspace
        </div>
      </footer>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </Link>
  );
}

function formatRole(role: "USER" | "SUPPORT" | "ADMIN") {
  if (role === "SUPPORT") return "Support";
  if (role === "ADMIN") return "Administrator";

  return "Employee";
}
