"use server";

import { hashSync } from "bcryptjs";
import { AuthError } from "next-auth";
import { unstable_rethrow } from "next/navigation";

import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatError } from "@/lib/utils";
import {
  insertUserSchema,
  loginUserSchema,
  updateUserSchema,
} from "@/lib/validators";
import { UserWhereInput } from "../generated/prisma/models";

/// auth
export async function loginUser(_prevState: unknown, formData: FormData) {
  try {
    const user = loginUserSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", {
      ...user,
      redirectTo: "/",
    });

    return { status: "success", message: "Signed in successfully" };
  } catch (error) {
    unstable_rethrow(error);

    return {
      status: "error",
      // authentication errors are thrown as AuthError instances, so we can check for that
      message:
        error instanceof AuthError
          ? "Invalid email or password"
          : formatError(error),
    };
  }
}

export async function signUpUser(_prevState: unknown, formData: FormData) {
  try {
    const user = insertUserSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const plainPassword = user.password;
    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
      redirectTo: "/",
    });

    return { status: "success", message: "User registered successfully" };
  } catch (error) {
    unstable_rethrow(error);

    return { status: "error", message: formatError(error) };
  }
}

export async function signOutUser() {
  return await signOut({ redirectTo: "/login" });
}

// USER role actions

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      assets: true,
      assignedTickets: true,
      createdTickets: true,
    },
  });

  if (!user) throw new Error("User not found!");

  return user;
}

export async function getOpenUserTickets(userId: string) {
  const openTickets = await prisma.ticket.findMany({
    where: {
      assignedToId: userId,
      status: "OPEN",
    },
  });

  return openTickets;
}

// SUPPORT role actions

export async function getAllOpenTickets() {
  const openTickets = await prisma.ticket.findMany({
    where: {
      status: "OPEN",
    },
  });

  return openTickets;
}

export async function getAdminUsers({
  search,
  role,
  page,
}: {
  search: string;
  role: "all" | "USER" | "SUPPORT" | "ADMIN";
  page: number;
}) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const searchFilter: UserWhereInput = {
    name: {
      contains: search,
      mode: "insensitive",
    },
    role: role && role !== "all" ? (role as UserWhereInput["role"]) : undefined,
  };

  const pageSize = Number(process.env.PAGE_SIZE ?? 10);

  const [users, userCount] = await Promise.all([
    // users
    prisma.user.findMany({
      where: searchFilter,
      select: {
        id: true,
        name: true,
        email: true,
        room: true,
        role: true,

        _count: {
          select: {
            assets: true,

            assignedTickets: {
              where: {
                // need only those which are in progress, not closed or open (so basically not the whole record)
                status: "IN_PROGRESS",
              },
            },
          },
        },
      },

      take: pageSize,
      skip: (page - 1) * pageSize,

      orderBy: {
        name: "asc",
      },
    }),

    // usercount
    prisma.user.count({
      where: searchFilter,
    }),
  ]);

  return {
    users,
    userCount,
    page,
    pageSize: pageSize,
    totalPages: Math.ceil(userCount / pageSize),
  };
}

export async function getAdminUserById(userId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      room: true,
      role: true,
      createdAt: true,
      updatedAt: true,

      assets: {
        select: {
          id: true,
          assetNumber: true,
          manufacturer: true,
          model: true,
          type: true,
          status: true,
          serialNumber: true,
        },

        orderBy: {
          assetNumber: "asc",
        },
      },

      // Show only latest 10 here.
      // This page shouldn't load someone's entire ticket history.
      createdTickets: {
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,

          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },

          relatedAsset: {
            select: {
              id: true,
              assetNumber: true,
              manufacturer: true,
              model: true,
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
          assets: true,

          createdTickets: true,

          assignedTickets: {
            where: {
              status: "IN_PROGRESS",
            },
          },
        },
      },
    },
  });
}

export async function updateUser(userId: string, data: unknown) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const validated = updateUserSchema.parse(data);

  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // Check whether another user already uses this email
  const emailUser = await prisma.user.findFirst({
    where: {
      email: validated.email,

      NOT: {
        id: userId,
      },
    },
  });

  if (emailUser) {
    throw new Error("A user with this email already exists.");
  }

  return prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      name: validated.name,
      email: validated.email,
      room: validated.room || null,
      role: validated.role,
    },
  });
}
