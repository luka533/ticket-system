"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Dashboard data for support
export async function getSupportDashboardData() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  if (session.user.role !== "SUPPORT") {
    throw new Error("Unauthorized");
  }

  // Start of today in order to get the FULL 7 days
  // that way we do not get a frame starting at 19:45 six days ago for example
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start of 7-day period
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  // performant way to get all the count and data we need for the dashboard in one go
  // we use Promise.all to run all the queries in parallel
  // since it need a lot of queries to get all the data we need for the dashboard, this is a good way to do it
  const [
    unassignedCount,
    myInProgressCount,
    closedThisWeekCount,
    assetsInRepairCount,
    unassignedTickets,
    myTickets,
    createdTickets,
    closedTickets,
  ] = await Promise.all([
    // Unassigned tickets
    prisma.ticket.count({
      where: {
        status: "OPEN",
        assignedToId: null,
      },
    }),

    // support user amount of progress tickets
    prisma.ticket.count({
      where: {
        status: "IN_PROGRESS",
        assignedToId: session.user.id,
      },
    }),

    // Tickets closed by the whole support team
    // during the last 7 days
    prisma.ticket.count({
      where: {
        status: "CLOSED",
        closedAt: {
          gte: sevenDaysAgo,
        },
      },
    }),

    // Assets currently being repaired
    prisma.asset.count({
      where: {
        status: "REPAIR",
      },
    }),

    // Newest tickets requiring attention
    prisma.ticket.findMany({
      where: {
        status: "OPEN",
        assignedToId: null,
      },

      include: {
        createdBy: true,
        assignedTo: true,
        relatedAsset: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 4,
    }),

    // Tickets current support user is working on
    prisma.ticket.findMany({
      where: {
        status: "IN_PROGRESS",
        assignedToId: session.user.id,
      },

      include: {
        createdBy: true,
        assignedTo: true,
        relatedAsset: true,
      },

      orderBy: {
        updatedAt: "desc",
      },

      take: 4,
    }),

    // Created ticket dates for chart
    prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },

      select: {
        createdAt: true,
      },
    }),

    // Closed ticket dates for chart
    prisma.ticket.findMany({
      where: {
        closedAt: {
          gte: sevenDaysAgo,
        },
      },

      select: {
        closedAt: true,
      },
    }),
  ]);

  // Create empty chart entries for every day
  // will be used for charts therefore we also need empty days
  const ticketActivity = Array.from({
    length: 7,
  }).map((_, index) => {
    const date = new Date(sevenDaysAgo);

    date.setDate(sevenDaysAgo.getDate() + index);

    return {
      date: formatDateKey(date),

      label: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),

      created: 0,
      closed: 0,
    };
  });

  // Count created tickets
  // looping over all the tickets created from a week ago
  for (const ticket of createdTickets) {
    // we format the date to be in the same format as in the ticketactivity to compare
    const date = formatDateKey(ticket.createdAt);

    // if the days match we increase the created count
    const day = ticketActivity.find((item) => item.date === date);

    if (day) {
      // since day is still a reference to ticketacitivity's matched object we can mutate it
      day.created++;
    }
  }

  // Count closed tickets
  for (const ticket of closedTickets) {
    // if not closed then skip loop
    if (!ticket.closedAt) {
      continue;
    }

    const date = formatDateKey(ticket.closedAt);

    const day = ticketActivity.find((item) => item.date === date);

    // since day is still a reference to ticketacitivity's matched object we can mutate it

    if (day) {
      day.closed++;
    }
  }

  return {
    unassignedCount,
    myInProgressCount,
    closedThisWeekCount,
    assetsInRepairCount,

    unassignedTickets,
    myTickets,

    ticketActivity,
  };
}

function formatDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

// dashboard data for admins
export async function getAdminDashboardData() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [
    unassignedCount,
    inProgressCount,
    closedThisWeekCount,
    assetsInRepairCount,
    unassignedTickets,
    repairAssets,
    supportUsers,
    createdTickets,
    closedTickets,
  ] = await Promise.all([
    // Tickets still waiting for support
    prisma.ticket.count({
      where: {
        status: "OPEN",
        assignedToId: null,
      },
    }),

    // All tickets currently being worked on
    prisma.ticket.count({
      where: {
        status: "IN_PROGRESS",
      },
    }),

    // All tickets completed during the last 7 days
    prisma.ticket.count({
      where: {
        status: "CLOSED",
        closedAt: {
          gte: sevenDaysAgo,
        },
      },
    }),

    // Devices currently being repaired
    prisma.asset.count({
      where: {
        status: "REPAIR",
      },
    }),

    // Latest unassigned tickets
    prisma.ticket.findMany({
      where: {
        status: "OPEN",
        assignedToId: null,
      },

      include: {
        createdBy: true,
        assignedTo: true,
        relatedAsset: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 4,
    }),

    // Assets requiring attention
    prisma.asset.findMany({
      where: {
        status: "REPAIR",
      },

      include: {
        assignedTo: true,
      },

      orderBy: {
        updatedAt: "desc",
      },

      take: 4,
    }),

    // Workload of each support employee
    prisma.user.findMany({
      where: {
        role: "SUPPORT",
      },

      select: {
        id: true,
        name: true,
        email: true,

        _count: {
          select: {
            assignedTickets: {
              where: {
                status: "IN_PROGRESS",
              },
            },
          },
        },
      },

      orderBy: {
        name: "asc",
      },
    }),

    // Tickets created during last 7 days
    prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },

      select: {
        createdAt: true,
      },
    }),

    // Tickets closed during last 7 days
    prisma.ticket.findMany({
      where: {
        closedAt: {
          gte: sevenDaysAgo,
        },
      },

      select: {
        closedAt: true,
      },
    }),
  ]);

  // Prepare 7 empty days
  const ticketActivity = Array.from({
    length: 7,
  }).map((_, index) => {
    const date = new Date(sevenDaysAgo);

    date.setDate(sevenDaysAgo.getDate() + index);

    return {
      date: formatDateKey(date),

      label: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),

      created: 0,
      closed: 0,
    };
  });

  // Add created tickets
  for (const ticket of createdTickets) {
    const date = formatDateKey(ticket.createdAt);

    const day = ticketActivity.find((item) => item.date === date);

    if (day) {
      day.created++;
    }
  }

  // Add closed tickets
  for (const ticket of closedTickets) {
    if (!ticket.closedAt) continue;

    const date = formatDateKey(ticket.closedAt);

    const day = ticketActivity.find((item) => item.date === date);

    if (day) {
      day.closed++;
    }
  }

  return {
    unassignedCount,
    inProgressCount,
    closedThisWeekCount,
    assetsInRepairCount,

    unassignedTickets,
    repairAssets,
    supportUsers,

    ticketActivity,
  };
}
