"use server";

import { auth } from "@/auth";
import { prisma } from "../prisma";
import { AssetWhereInput } from "../generated/prisma/models";
import { insertAssetSchema, updateAssetSchema } from "../validators";

type TypeFilter =
  | "all"
  | "LAPTOP"
  | "DESKTOP"
  | "MONITOR"
  | "PRINTER"
  | "PHONE"
  | "OTHER";

type StatusFilter = "all" | "AVAILABLE" | "IN_USE" | "REPAIR" | "RETIRED";

export async function getAllAssets({
  search,
  type,
  status,
  page,
}: {
  search: string;
  type: TypeFilter;
  status: StatusFilter;
  page: number;
}) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  if (session.user.role === "USER") {
    throw new Error("Unauthorized");
  }

  const pageSize = Number(process.env.PAGE_SIZE) || 10;

  // we can search for manufacurer, model and serialnumber at the same input
  // https://www.prisma.io/docs/orm/v6/prisma-client/queries/filtering-and-sorting
  const searchFilter: AssetWhereInput = {
    OR: [
      {
        manufacturer: {
          contains: search ? search : "",
          mode: "insensitive",
        },
      },
      {
        model: {
          contains: search ? search : "",
          mode: "insensitive",
        },
      },
      {
        serialNumber: {
          contains: search ? search : "",
          mode: "insensitive",
        },
      },
    ],

    type: type !== "all" ? type : undefined,
    status: status !== "all" ? status : undefined,
  };

  const [assets, assetCount] = await Promise.all([
    // assets
    prisma.asset.findMany({
      where: searchFilter,

      select: {
        id: true,
        assetNumber: true,
        type: true,
        manufacturer: true,
        model: true,
        serialNumber: true,
        status: true,

        // get the assigned users id and name (nested select for relations)
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        assetNumber: "asc",
      },

      take: pageSize,
      skip: (page - 1) * pageSize,
    }),

    // count
    prisma.asset.count({
      where: searchFilter,
    }),
  ]);

  return {
    assets,
    assetCount,
    page,
    pageSize,
    totalPages: Math.ceil(assetCount / pageSize),
  };
}

export async function getCurrentUserAssets() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  return prisma.asset.findMany({
    where: {
      assignedToId: session.user.id,
    },

    select: {
      id: true,
      assetNumber: true,
      type: true,
      manufacturer: true,
      model: true,
      serialNumber: true,
      status: true,
    },

    orderBy: {
      assetNumber: "asc",
    },
  });
}

export async function createAsset(data: unknown) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const validated = insertAssetSchema.parse(data);

  // Optional serial number duplicate check
  if (validated.serialNumber) {
    const existingAsset = await prisma.asset.findUnique({
      where: {
        serialNumber: validated.serialNumber,
      },
    });

    if (existingAsset) {
      throw new Error("An asset with this serial number already exists.");
    }
  }

  // If an asset is assigned to someone,
  // it should normally be IN_USE.
  const status = validated.assignedToId ? "IN_USE" : validated.status;

  return prisma.asset.create({
    data: {
      type: validated.type,
      manufacturer: validated.manufacturer,
      model: validated.model,

      serialNumber: validated.serialNumber || null,

      status,

      assignedToId: validated.assignedToId || null,
    },
  });
}

export async function getAdminAssetById(assetId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.asset.findUnique({
    where: {
      id: assetId,
    },

    select: {
      id: true,
      assetNumber: true,
      type: true,
      manufacturer: true,
      model: true,
      serialNumber: true,
      status: true,
      createdAt: true,
      updatedAt: true,

      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          room: true,
        },
      },

      // Latest related tickets only (last 10)
      tickets: {
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,

          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },

          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 10,
      },

      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });
}

export async function updateAsset(assetId: string, data: unknown) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const validated = updateAssetSchema.parse(data);

  const asset = await prisma.asset.findUnique({
    where: {
      id: assetId,
    },
  });

  if (!asset) {
    throw new Error("Asset not found");
  }

  // Check whether another asset already has this serial number
  if (validated.serialNumber) {
    const duplicate = await prisma.asset.findFirst({
      where: {
        serialNumber: validated.serialNumber,

        NOT: {
          id: assetId,
        },
      },
    });

    if (duplicate) {
      throw new Error("An asset with this serial number already exists.");
    }
  }

  let status = validated.status;
  let assignedToId = validated.assignedToId || null;

  // Assigned device cannot still be AVAILABLE
  if (assignedToId && status === "AVAILABLE") {
    status = "IN_USE";
  }

  // Retired assets should no longer be assigned
  if (status === "RETIRED") {
    assignedToId = null;
  }

  return prisma.asset.update({
    where: {
      id: assetId,
    },

    data: {
      type: validated.type,
      manufacturer: validated.manufacturer,
      model: validated.model,

      serialNumber: validated.serialNumber || null,

      status,
      assignedToId,
    },
  });
}
