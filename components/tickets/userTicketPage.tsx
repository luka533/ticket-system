import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getCurrentUserTickets } from "@/lib/actions/ticket.actions";
import UserTicketRow from "./userTicketRow";

async function TicketsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const tickets = await getCurrentUserTickets();

  const openCount = tickets.filter((ticket) => ticket.status === "OPEN").length;

  const progressCount = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS",
  ).length;

  const closedCount = tickets.filter(
    (ticket) => ticket.status === "CLOSED",
  ).length;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Tickets</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Track your IT support requests.
          </p>
        </div>

        <Link
          href="/tickets/new"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Ticket
        </Link>
      </div>

      {/* Small stats */}
      <div className="flex gap-6 border-b pb-4 text-sm">
        <Stat label="Open" value={openCount} />
        <Stat label="In Progress" value={progressCount} />
        <Stat label="Closed" value={closedCount} />
      </div>

      {/* Ticket list */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">All Tickets</h2>

          <span className="text-xs text-muted-foreground">
            {tickets.length} total
          </span>
        </div>

        {tickets.length > 0 ? (
          <div className="overflow-hidden rounded-lg border">
            {tickets.map((ticket) => (
              <UserTicketRow key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed py-12 text-center">
            <p className="text-sm font-medium">No tickets yet</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Create a ticket when you need IT support.
            </p>

            <Link
              href="/tickets/new"
              className="mt-4 inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
            >
              Create Ticket
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xl font-semibold">{value}</span>

      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

export default TicketsPage;
