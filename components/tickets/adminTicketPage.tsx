import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { getSupportTickets } from "@/lib/actions/ticket.actions";

import SupportTicketRow from "./supportTicketRow";

type Filter = "all" | "unassigned" | "in-progress" | "closed" | "canceled";

type Props = {
  searchParams: Promise<{
    filter?: string;
    page?: string;
    sort?: string;
  }>;
};

const filters: {
  value: Filter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "unassigned", label: "Unassigned" },
  { value: "in-progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
  { value: "canceled", label: "Canceled" },
];

async function AdminTicketPage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;

  const filter = filters.some((item) => item.value === params.filter)
    ? (params.filter as Filter)
    : "all";

  const page = Math.max(Number(params.page) || 1, 1);

  const sort = params.sort === "oldest" ? "oldest" : "newest";

  const result = await getSupportTickets({
    filter,
    page,
    sort,
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Ticket Management
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Monitor and manage support tickets across the organization.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Link
            key={item.value}
            href={`/tickets?filter=${item.value}&sort=${sort}`}
            className={`rounded-md border px-3 py-2 text-sm ${
              filter === item.value
                ? "bg-foreground text-background"
                : "hover:bg-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Sort / count */}
      <div className="flex items-center justify-between border-b pb-3">
        <p className="text-sm text-muted-foreground">
          {result.ticketCount} tickets
        </p>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">Order by</span>

          <Link
            href={`/tickets?filter=${filter}&sort=newest`}
            className={
              sort === "newest" ? "font-medium" : "text-muted-foreground"
            }
          >
            Newest
          </Link>

          <Link
            href={`/tickets?filter=${filter}&sort=oldest`}
            className={
              sort === "oldest" ? "font-medium" : "text-muted-foreground"
            }
          >
            Oldest
          </Link>
        </div>
      </div>

      {/* Tickets */}
      {result.tickets.length > 0 ? (
        <div className="overflow-hidden rounded-lg border">
          {result.tickets.map((ticket) => (
            <SupportTicketRow key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No tickets found.</p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {result.page} of {Math.max(result.totalPages, 1)}
        </p>

        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={`/tickets?filter=${filter}&sort=${sort}&page=${page - 1}`}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              Previous
            </Link>
          )}

          {page < result.totalPages && (
            <Link
              href={`/tickets?filter=${filter}&sort=${sort}&page=${page + 1}`}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTicketPage;
