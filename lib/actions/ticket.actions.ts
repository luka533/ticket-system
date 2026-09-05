"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { insertTicketSchema } from "../validators";
import { TicketWhereInput } from "../generated/prisma/models";

export async function getCurrentUserTickets() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return prisma.ticket.findMany({
    where: {
      createdById: session.user.id,
    },
    include: {
      createdBy: true,
      assignedTo: true,
      relatedAsset: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getTicketById(ticketId: string) {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
    },
    include: {
      assignedTo: true,
      createdBy: true,
      relatedAsset: true,
    },
  });

  return ticket;
}

export async function createTicket(data: unknown) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validatedData = insertTicketSchema.parse(data);

  // If an asset was selected, verify that it actually
  // belongs to the logged-in user.
  if (validatedData.relatedAssetId) {
    const asset = await prisma.asset.findFirst({
      where: {
        id: validatedData.relatedAssetId,
        assignedToId: session.user.id,
      },
    });

    if (!asset) {
      throw new Error("Invalid asset.");
    }
  }

  const ticket = await prisma.ticket.create({
    data: {
      title: validatedData.title,
      description: validatedData.description,

      createdById: session.user.id,

      relatedAssetId: validatedData.relatedAssetId || null,
    },
  });

  return ticket;
}

export async function assignTicketToMe(ticketId: string) {
  const session = await auth();

  if (!session) {
    throw new Error("Not Authenticated");
  }

  if (session?.user.role !== "SUPPORT") {
    throw new Error("Unauthorized");
  }

  await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      assignedToId: session.user.id,
      status: "IN_PROGRESS",
    },
  });

  revalidatePath(`/tickets/${ticketId}`);

  return;
}

export async function closeTicket(ticketId: string) {
  const session = await auth();
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId },
    include: {
      assignedTo: true,
    },
  });

  if (
    !session?.user?.id &&
    session?.user.role !== "SUPPORT" &&
    session?.user.id !== ticket?.assignedTo?.id
  ) {
    throw new Error("Unauthorized");
  }

  await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
    },
  });

  revalidatePath(`/tickets/${ticketId}`);

  return;
}

export async function deleteTicket(ticketId: string) {
  const session = await auth();

  if (!session?.user?.id && session?.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.ticket.delete({
    where: {
      id: ticketId,
    },
  });

  revalidatePath(`/tickets/${ticketId}`);

  return;
}

export async function cancelTicket(ticketId: string) {
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId },
    include: {
      createdBy: true,
    },
  });

  const session = await auth();

  if (
    !session?.user?.id ||
    session?.user.role !== "USER" ||
    ticket?.createdBy.id !== session.user.id
  ) {
    throw new Error("Unauthorized");
  }

  await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      assignedToId: null,
      status: "CANCELED",
    },
  });

  revalidatePath(`/tickets/${ticketId}`);

  return;
}

// Support tickets are only visible to SUPPORT and ADMIN users

type SupportTicketFilter =
  | "all"
  | "unassigned"
  | "mine"
  | "in-progress"
  | "closed"
  | "canceled";

export async function getSupportTickets({
  filter = "all",
  page = 1,
  sort = "newest",
}: {
  filter?: SupportTicketFilter;
  page?: number;
  sort?: "newest" | "oldest";
}) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  if (session.user.role !== "SUPPORT" && session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // filtering
  let filterObj: TicketWhereInput = {}; // Default when filter is all
  if (filter === "canceled") filterObj = { status: "CANCELED" };
  if (filter === "closed") filterObj = { status: "CLOSED" };
  if (filter === "in-progress") filterObj = { status: "IN_PROGRESS" };
  if (filter === "unassigned")
    filterObj = { assignedToId: null, status: "OPEN" };
  if (filter === "mine")
    filterObj = { assignedToId: session.user.id, status: "IN_PROGRESS" };

  const tickets = await prisma.ticket.findMany({
    // filtering
    where: filterObj,
    // include all relations
    include: {
      createdBy: true,
      assignedTo: true,
      relatedAsset: true,
    },

    // sorting
    orderBy: {
      createdAt: sort === "newest" ? "desc" : "asc",
    },
    // pagination
    // if page is 1, skip 0, if page is 2, skip 10, if page is 3, skip 20, etc.
    skip: (page - 1) * Number(process.env.PAGE_SIZE || 10),
    // take 10 tickets per page, or the value of PAGE_SIZE env variable, for now it is set to 10 (but may vary when testing)
    take: Number(process.env.PAGE_SIZE || 10),
  });

  // All tickets count of the filter
  const ticketCount = await prisma.ticket.count({
    where: filterObj,
  });

  return {
    tickets,
    ticketCount,
    page,
    pageSize: Number(process.env.PAGE_SIZE || 10),
    totalPages: Math.ceil(ticketCount / Number(process.env.PAGE_SIZE || 10)),
  };
}
