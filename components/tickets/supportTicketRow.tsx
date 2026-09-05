import Link from "next/link";

import { formatDate } from "@/lib/utils";
import type { TicketWithRelations } from "@/types";

function getStatusLabel(status: TicketWithRelations["status"]) {
  if (status === "IN_PROGRESS") {
    return "In Progress";
  }

  if (status === "CLOSED") {
    return "Closed";
  }

  return "Open";
}

export default function SupportTicketRow({
  ticket,
}: {
  ticket: TicketWithRelations;
}) {
  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="block border-b px-4 py-4 transition-colors last:border-b-0 hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-medium">{ticket.title}</h3>

            <span className="shrink-0 rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
              {getStatusLabel(ticket.status)}
            </span>
          </div>

          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {ticket.description}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Created by: {ticket.createdBy.name}</span>

            <span>Assigned: {ticket.assignedTo?.name ?? "Unassigned"}</span>

            {ticket.relatedAsset && (
              <span>
                ASSET-
                {String(ticket.relatedAsset.assetNumber).padStart(4, "0")}
              </span>
            )}
          </div>
        </div>

        <span className="shrink-0 text-xs text-muted-foreground">
          {formatDate(ticket.createdAt)}
        </span>
      </div>
    </Link>
  );
}
