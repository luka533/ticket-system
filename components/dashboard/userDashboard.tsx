import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketWithRelations, UserWithRelations } from "@/types";
import Ticket from "./ticket";
import Link from "next/link";

function UserDashboard({ user }: { user: UserWithRelations }) {
  const assets = user.assets || [];
  const tickets = user.createdTickets || [];

  const ticketsInProgress = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS",
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back,{" "}
            {user.name.charAt(0).toUpperCase() + user.name.slice(1)}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View your support tickets and assigned assets.
          </p>
        </div>

        <Link
          href="/tickets/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          New Ticket
        </Link>
      </div>

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tickets
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-semibold">{tickets.length}</p>
            <Link
              href="/tickets"
              className="text-sm text-primary hover:underline mt-3 block"
            >
              View All Tickets
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-semibold">{ticketsInProgress.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Assets
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-semibold">{assets.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My In Progress Tickets</CardTitle>
          </CardHeader>

          <CardContent>
            {ticketsInProgress.length > 0 ? (
              ticketsInProgress.map((ticket) => (
                <Ticket
                  key={ticket.id}
                  ticket={ticket as TicketWithRelations}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                You have no in-progress tickets.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Assets</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your assigned company devices will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserDashboard;
