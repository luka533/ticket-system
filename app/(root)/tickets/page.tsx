import { auth } from "@/auth";
import AdminTicketPage from "@/components/tickets/adminTicketPage";
import SupportTicketPage from "@/components/tickets/supportTicketPage";
import UserTicketPage from "@/components/tickets/userTicketPage";
import { redirect } from "next/navigation";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ticket Overview",
};

type Props = {
  searchParams: Promise<{
    filter?: string;
    page?: string;
    sort?: string;
  }>;
};

async function TicketOverviewPage({ searchParams }: Props) {
  // if USER, show only their tickets
  // if SUPPORT, show all tickets + ability to assign them to themselves
  // if ADMIN, show all tickets + ability to cancel them
  const session = await auth();
  if (!session) return redirect("/login");

  if (session?.user.role === "ADMIN")
    return <AdminTicketPage searchParams={searchParams} />;
  if (session?.user.role === "SUPPORT")
    return <SupportTicketPage searchParams={searchParams} />;

  return <UserTicketPage />;
}

export default TicketOverviewPage;
