import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAdminUserById } from "@/lib/actions/user.actions";
import { formatDate } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function UserDetailsPage({ params }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const user = await getAdminUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Back */}
      <Link
        href="/users"
        className="inline-flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted"
      >
        ← Back to users
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {user.name}
            </h1>

            <RoleBadge role={user.role} />
          </div>

          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>

        <Link
          href={`/users/${user.id}/edit`}
          className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          Edit User
        </Link>
      </div>

      {/* Stats */}
      <div
        className={`grid gap-4 ${
          user.role === "SUPPORT"
            ? "sm:grid-cols-2 lg:grid-cols-4"
            : "sm:grid-cols-3"
        }`}
      >
        <StatCard label="Assigned Assets" value={user._count.assets} />

        <StatCard
          label="Submitted Tickets"
          value={user._count.createdTickets}
        />

        {user.role === "SUPPORT" && (
          <StatCard label="In Progress" value={user._count.assignedTickets} />
        )}

        <StatCard
          label="Member Since"
          value={formatDate(user.createdAt)}
          small
        />
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Name" value={user.name} />

            <Info label="Email" value={user.email} />

            <Info label="Room" value={user.room ?? "Not assigned"} />

            <Info label="Role" value={formatRole(user.role)} />
          </div>
        </CardContent>
      </Card>

      {/* Assets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Assigned Assets</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Company devices currently assigned to this user.
            </p>
          </div>

          <Badge variant="outline">{user.assets.length}</Badge>
        </CardHeader>

        <CardContent>
          {user.assets.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {user.assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {asset.manufacturer} {asset.model}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            ASSET-
                            {String(asset.assetNumber).padStart(4, "0")}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {formatAssetType(asset.type)}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {formatAssetStatus(asset.status)}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {asset.serialNumber ?? "—"}
                      </TableCell>

                      <TableCell className="text-right">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="inline-flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted"
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
            <EmptyState>
              No assets are currently assigned to this user.
            </EmptyState>
          )}
        </CardContent>
      </Card>

      {/* Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Tickets</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Latest support requests submitted by this user.
            </p>
          </div>

          <Badge variant="outline">{user._count.createdTickets}</Badge>
        </CardHeader>

        <CardContent>
          {user.createdTickets.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {user.createdTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.title}</p>

                          {ticket.relatedAsset && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              ASSET-
                              {String(ticket.relatedAsset.assetNumber).padStart(
                                4,
                                "0",
                              )}{" "}
                              · {ticket.relatedAsset.manufacturer}{" "}
                              {ticket.relatedAsset.model}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {formatTicketStatus(ticket.status)}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {ticket.assignedTo?.name ?? "Unassigned"}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {formatDate(ticket.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        {/* <Link
                          href={`/assets/${asset.id}`}
                          className="inline-flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted"
                        >
                          View
                        </Link> */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState>This user has not submitted any tickets.</EmptyState>
          )}

          {user._count.createdTickets > user.createdTickets.length && (
            <>
              <Separator className="my-4" />

              <p className="text-center text-xs text-muted-foreground">
                Showing the latest {user.createdTickets.length} of{" "}
                {user._count.createdTickets} tickets.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  small = false,
}: {
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>

        <p className={`mt-2 font-semibold ${small ? "text-lg" : "text-2xl"}`}>
          {value}
        </p>
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

function RoleBadge({ role }: { role: "USER" | "SUPPORT" | "ADMIN" }) {
  return <Badge variant="outline">{formatRole(role)}</Badge>;
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed py-10 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function formatRole(role: "USER" | "SUPPORT" | "ADMIN") {
  if (role === "SUPPORT") return "Support";
  if (role === "ADMIN") return "Admin";

  return "User";
}

function formatTicketStatus(status: string) {
  if (status === "IN_PROGRESS") {
    return "In Progress";
  }

  if (status === "CANCELED") {
    return "Canceled";
  }

  if (status === "CLOSED") {
    return "Closed";
  }

  return "Open";
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

export default UserDetailsPage;
