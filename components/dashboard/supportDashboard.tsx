import Link from "next/link";
import type { ReactNode } from "react";

import { getSupportDashboardData } from "@/lib/actions/dashboard.actions";

import SupportTicketRow from "@/components/tickets/supportTicketRow";
import TicketActivityChart from "./ticketActivityChart";

async function SupportDashboard() {
  const data = await getSupportDashboardData();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Support Dashboard
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Overview of the current support workload.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Unassigned"
          value={data.unassignedCount}
          description="Waiting for support"
          href="/tickets?filter=unassigned"
        />

        <StatCard
          label="My In Progress"
          value={data.myInProgressCount}
          description="Currently assigned to you"
          href="/tickets?filter=mine"
        />

        <StatCard
          label="Closed This Week"
          value={data.closedThisWeekCount}
          description="Completed by support"
          href="/tickets?filter=closed"
        />

        <StatCard
          label="Assets in Repair"
          value={data.assetsInRepairCount}
          description="Currently unavailable"
          href="/assets"
        />
      </div>

      {/* Chart */}
      <section className="rounded-lg border p-5">
        <div className="mb-6">
          <h2 className="text-sm font-semibold">Ticket Activity</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Tickets created and closed during the last 7 days.
          </p>
        </div>

        <TicketActivityChart data={data.ticketActivity} />
      </section>

      {/* Ticket lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Needs attention */}
        <section>
          <SectionHeader
            title="Needs Attention"
            description="New tickets waiting for support."
            href="/tickets?filter=unassigned"
          />

          {data.unassignedTickets.length > 0 ? (
            <div className="overflow-hidden rounded-lg border">
              {data.unassignedTickets.map((ticket) => (
                <SupportTicketRow key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <EmptyState>No unassigned tickets.</EmptyState>
          )}
        </section>

        {/* Current user's work */}
        <section>
          <SectionHeader
            title="My Work"
            description="Tickets you are currently working on."
            href="/tickets?filter=in-progress"
          />

          {data.myTickets.length > 0 ? (
            <div className="overflow-hidden rounded-lg border">
              {data.myTickets.map((ticket) => (
                <SupportTicketRow key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <EmptyState>You have no tickets in progress.</EmptyState>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
  href,
}: {
  label: string;
  value: number;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border p-4 transition-colors hover:bg-muted/40"
    >
      <p className="text-sm font-medium">{label}</p>

      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>

      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}

function SectionHeader({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>

        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>

      <Link
        href={href}
        className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        View all
      </Link>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed px-4 py-10 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

export default SupportDashboard;
