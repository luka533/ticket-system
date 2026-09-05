"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Boxes, LayoutDashboard, Tickets, Users } from "lucide-react";

const links = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/tickets",
    label: "Tickets",
    icon: Tickets,
  },
  {
    href: "/assets",
    label: "Assets",
    icon: Boxes,
  },
];

export default function AppNav({
  role,
}: {
  role: "USER" | "SUPPORT" | "ADMIN";
}) {
  const pathname = usePathname();

  // if role is admin add a users navlink
  const navigation =
    role === "ADMIN"
      ? [
          ...links,
          {
            href: "/users",
            label: "Users",
            icon: Users,
          },
        ]
      : links;

  return (
    <nav className="flex items-center gap-1">
      {navigation.map((item) => {
        const Icon = item.icon;

        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />

            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
