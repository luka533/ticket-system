import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import CreateTicketForm from "@/components/tickets/create-ticket-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Ticket",
};

async function CreateTicketPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const assets = await prisma.asset.findMany({
    where: {
      assignedToId: session.user.id,
    },
    orderBy: {
      assetNumber: "asc",
    },
  });

  return (
    <div className="mx-auto w-full max-w-2xl">
      <CreateTicketForm assets={assets} />
    </div>
  );
}

export default CreateTicketPage;
