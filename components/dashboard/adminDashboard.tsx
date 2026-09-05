import Link from "next/link";

import { getAdminDashboardData } from "@/lib/actions/dashboard.actions";

import SupportTicketRow from "@/components/tickets/supportTicketRow";
import TicketActivityChart from "./ticketActivityChart";

async function AdminDashboard() {
  const data = await getAdminDashboardData();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Overview of IT support operations and resources.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/users"
            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Manage Users
          </Link>

          <Link
            href="/assets"
            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Manage Assets
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Unassigned"
          value={data.unassignedCount}
          description="Waiting for support"
          href="/tickets?filter=unassigned"
        />

        <StatCard
          label="In Progress"
          value={data.inProgressCount}
          description="Currently being worked on"
          href="/tickets?filter=in-progress"
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
          href="/assets?status=repair"
        />
      </div>

      {/* Ticket activity */}
      <section className="rounded-lg border p-5">
        <div className="mb-6">
          <h2 className="text-sm font-semibold">Ticket Activity</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Tickets created and closed during the last 7 days.
          </p>
        </div>

        <TicketActivityChart data={data.ticketActivity} />
      </section>

      {/* Problems */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Unassigned tickets */}
        <section>
          <SectionHeader
            title="Open Tickets"
            description="Tickets that have not been assigned yet."
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

        {/* Assets */}
        <section>
          <SectionHeader
            title="Assets in Repair"
            description="Devices currently requiring attention."
            href="/assets?status=repair"
          />

          {data.repairAssets.length > 0 ? (
            <div className="overflow-hidden rounded-lg border">
              {data.repairAssets.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/assets/${asset.id}`}
                  className="block border-b px-4 py-4 transition-colors last:border-b-0 hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        {asset.manufacturer} {asset.model}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        ASSET-
                        {String(asset.assetNumber).padStart(4, "0")}
                      </p>
                    </div>

                    <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                      Repair
                    </span>
                  </div>

                  {asset.assignedTo && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Assigned to: {asset.assignedTo.name}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState>No assets currently in repair.</EmptyState>
          )}
        </section>
      </div>

      {/* Support workload */}
      <section>
        <div className="mb-3">
          <h2 className="text-sm font-semibold">Support Workload</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Current in-progress tickets assigned to each support employee.
          </p>
        </div>

        {data.supportUsers.length > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            {data.supportUsers.map((supportUser) => (
              <div
                key={supportUser.id}
                className="flex items-center justify-between border-b px-4 py-4 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium">{supportUser.name}</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {supportUser.email}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {supportUser._count.assignedTickets}
                  </p>

                  <p className="text-xs text-muted-foreground">in progress</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState>No support employees found.</EmptyState>
        )}
      </section>
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

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed px-4 py-10 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

export default AdminDashboard;
