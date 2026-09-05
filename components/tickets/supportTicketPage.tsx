import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getSupportTickets } from "@/lib/actions/ticket.actions";

import SupportTicketRow from "./supportTicketRow";

type Filter =
  | "all"
  | "unassigned"
  | "mine"
  | "in-progress"
  | "closed"
  | "canceled";

// all searchParams
type Props = {
  searchParams: Promise<{
    filter?: string;
    page?: string;
    sort?: string;
  }>;
};
// all filter we offer and handle in server actons
const filters: {
  value: Filter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "unassigned", label: "Unassigned" },
  // assigned to the user
  { value: "mine", label: "My Active" },
  { value: "in-progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
  { value: "canceled", label: "Canceled" },
];

async function TicketsPage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "SUPPORT" && session.user.role !== "ADMIN") {
    redirect("/");
  }

  console.log("searchParams", searchParams);
  const params = await searchParams;

  console.log("params", params);

  // we search of the filter is in the list of filters we offer, if not, we default to "all"
  const filter = filters.some((item) => item.value === params.filter)
    ? (params.filter as Filter)
    : "all";

  // no negative page
  const page = Math.max(Number(params.page) || 1, 1);
  // sort either newest or oldest, default to newest
  const sort = params.sort === "oldest" ? "oldest" : "newest";

  const result = await getSupportTickets({
    filter,
    page,
    sort,
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Support Tickets
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Review and manage support requests.
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

      {/* Sort */}
      <div className="flex items-center justify-between border-b pb-3">
        <p className="text-sm text-muted-foreground">
          {result.ticketCount} tickets
        </p>

        <div className="flex gap-2 text-sm">
          <span className="text-sm text-muted-foreground font-extrabold mr-7">
            Order By
          </span>
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

        {/* if the page is 1 then do not show previous button */}
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={`/tickets?filter=${filter}&sort=${sort}&page=${page - 1}`}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              Previous
            </Link>
          )}

          {/* if the page is the last page then do not show next button */}

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

export default TicketsPage;
