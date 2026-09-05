import { formatDate } from "@/lib/utils";
import { TicketWithRelations } from "@/types";
import Link from "next/link";

function Ticket({ ticket }: { ticket: TicketWithRelations }) {
  return (
    <div className="mb-4 rounded-lg border p-4 shadow-sm">
      <h4 className="text-2xl font-semibold mb-2">{ticket.title}</h4>
      <p className="text-sm text-muted-foreground">{ticket.description}</p>
      <Link
        href={`/tickets/${ticket.id}`}
        className="mt-4 inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        View Details
      </Link>
      <p className="text-xs text-muted-foreground text-right">
        {formatDate(ticket.createdAt)}
      </p>
      <p className="text-sm text-muted-foreground">
        Assigned to: {ticket.assignedTo?.name || "Unassigned"}
      </p>
    </div>
  );
}

export default Ticket;
