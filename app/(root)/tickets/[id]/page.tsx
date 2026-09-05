import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { assignTicketToMe, getTicketById } from "@/lib/actions/ticket.actions";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AssignButton from "./assignToMeButton";
import DeleteTicketButton from "./deleteTicketButton";
import CancelTicketButton from "./cancelTicketButton";
import CloseTicketButton from "./closeTicketButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ticket Details",
};

async function TicketDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user.role;

  const { id } = await params;
  const ticket = await getTicketById(id);
  if (!ticket || !ticket.id) {
    notFound();
  }

  const statusStyles = {
    OPEN: "border-border bg-background text-foreground",
    IN_PROGRESS:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
    CLOSED:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
    CANCELED:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  };

  const statusLabel = {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    CLOSED: "Closed",
    CANCELED: "Canceled",
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      {/* Back */}
      <Link
        href="/tickets"
        className="inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to tickets
      </Link>

      {/* Main ticket card */}
      <div className="rounded-lg border bg-background p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              Ticket #{ticket.id.slice(0, 8)}
            </p>

            <h1 className="text-xl font-semibold tracking-tight">
              {ticket.title}
            </h1>
          </div>

          {ticket.status === "OPEN" && role === "SUPPORT" && (
            <AssignButton ticketId={ticket.id} />
          )}

          {ticket.status === "IN_PROGRESS" && role === "SUPPORT" && (
            <CloseTicketButton ticketId={ticket.id} />
          )}

          {role === "ADMIN" && <DeleteTicketButton ticketId={ticket.id} />}

          {role === "USER" && session.user.role === ticket.createdBy.id && (
            <CancelTicketButton ticketId={ticket.id} />
          )}

          <span
            className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium ${
              statusStyles[ticket.status]
            }`}
          >
            {statusLabel[ticket.status]}
          </span>
        </div>

        {/* Description */}
        <div className="mt-6 border-t pt-5">
          <p className="mb-2 text-sm font-medium">Description</p>

          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {ticket.description}
          </p>
        </div>

        {/* Metadata */}
        <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2">
          <Info label="Created by" value={ticket.createdBy.name} />

          <Info
            label="Assigned to"
            value={ticket.assignedTo?.name ?? "Unassigned"}
          />

          <Info label="Created" value={formatDate(ticket.createdAt)} />

          <Info label="Last updated" value={formatDate(ticket.updatedAt)} />
        </div>

        {/* Related asset */}
        <div className="mt-6 border-t pt-5">
          <p className="mb-2 text-sm font-medium">Related asset</p>

          {ticket.relatedAsset ? (
            <Link
              href={`/assets/${ticket.relatedAsset.id}`}
              className="inline-flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-muted"
            >
              <span className="text-sm font-medium">
                ASSET-
                {String(ticket.relatedAsset.assetNumber).padStart(4, "0")}
              </span>

              <span className="text-sm text-muted-foreground">
                {ticket.relatedAsset.manufacturer} {ticket.relatedAsset.model}
              </span>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">
              No asset related to this ticket.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

export default TicketDetailsPage;
