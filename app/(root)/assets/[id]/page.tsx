import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAdminAssetById } from "@/lib/actions/assets.actions";
import { formatDate } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const asset = await getAdminAssetById(id);

  if (!asset) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Back */}
      <Link
        href="/assets"
        className="inline-flex h-8 items-center rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        ← Back to assets
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {asset.manufacturer} {asset.model}
            </h1>

            <AssetStatusBadge status={asset.status} />
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            ASSET-
            {String(asset.assetNumber).padStart(4, "0")}
          </p>
        </div>

        <Link
          href={`/assets/${asset.id}/edit`}
          className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          Edit Asset
        </Link>
      </div>

      {/* Small overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Type" value={formatAssetType(asset.type)} />

        <StatCard label="Status" value={formatAssetStatus(asset.status)} />

        <StatCard label="Related Tickets" value={asset._count.tickets} />
      </div>

      {/* Asset information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Asset Information</CardTitle>

          <CardDescription>
            Hardware and inventory information for this asset.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Info
              label="Asset Number"
              value={`ASSET-${String(asset.assetNumber).padStart(4, "0")}`}
            />

            <Info label="Type" value={formatAssetType(asset.type)} />

            <Info label="Manufacturer" value={asset.manufacturer} />

            <Info label="Model" value={asset.model} />

            <Info
              label="Serial Number"
              value={asset.serialNumber ?? "Not provided"}
            />

            <Info label="Status" value={formatAssetStatus(asset.status)} />

            <Info label="Created" value={formatDate(asset.createdAt)} />

            <Info label="Last Updated" value={formatDate(asset.updatedAt)} />
          </div>
        </CardContent>
      </Card>

      {/* Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assignment</CardTitle>

          <CardDescription>
            Employee currently responsible for this asset.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {asset.assignedTo ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{asset.assignedTo.name}</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {asset.assignedTo.email}
                </p>

                {asset.assignedTo.room && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Room {asset.assignedTo.room}
                  </p>
                )}
              </div>

              <Link
                href={`/users/${asset.assignedTo.id}`}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View User
              </Link>
            </div>
          ) : (
            <div className="rounded-md border border-dashed py-8 text-center">
              <p className="text-sm font-medium">Unassigned</p>

              <p className="mt-1 text-sm text-muted-foreground">
                This asset is not currently assigned to an employee.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related tickets */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Related Tickets</CardTitle>

            <CardDescription>
              Support tickets connected to this asset.
            </CardDescription>
          </div>

          <Badge variant="outline">{asset._count.tickets}</Badge>
        </CardHeader>

        <CardContent>
          {asset.tickets.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {asset.tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <p className="font-medium">{ticket.title}</p>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {formatTicketStatus(ticket.status)}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {ticket.createdBy.name}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {ticket.assignedTo?.name ?? "Unassigned"}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {formatDate(ticket.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed py-10 text-center">
              <p className="text-sm font-medium">No related tickets</p>

              <p className="mt-1 text-sm text-muted-foreground">
                No support tickets have been linked to this asset.
              </p>
            </div>
          )}

          {asset._count.tickets > asset.tickets.length && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Showing the latest {asset.tickets.length} of{" "}
              {asset._count.tickets} tickets.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>

        <p className="mt-2 text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
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

function AssetStatusBadge({
  status,
}: {
  status: "AVAILABLE" | "IN_USE" | "REPAIR" | "RETIRED";
}) {
  return <Badge variant="outline">{formatAssetStatus(status)}</Badge>;
}

function formatAssetStatus(status: string) {
  if (status === "IN_USE") return "In Use";
  if (status === "REPAIR") return "Repair";
  if (status === "RETIRED") return "Retired";

  return "Available";
}

function formatAssetType(type: string) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

function formatTicketStatus(status: string) {
  if (status === "IN_PROGRESS") {
    return "In Progress";
  }

  if (status === "CLOSED") {
    return "Closed";
  }

  if (status === "CANCELED") {
    return "Canceled";
  }

  return "Open";
}

export default AssetDetailPage;
