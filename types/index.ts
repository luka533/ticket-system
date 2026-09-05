import { insertUserSchema } from "@/lib/validators";
import z from "zod";

import type { Prisma } from "@/lib/generated/prisma/client";

// prisma types do not automatically include relations, so we need to define a type that includes the relations like this
// https://stackoverflow.com/questions/68366105/get-full-type-on-prisma-client
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    createdTickets: true;
    assignedTickets: true;
    assets: true;
  };
}>;

export type TicketWithRelations = Prisma.TicketGetPayload<{
  include: {
    createdBy: true;
    assignedTo: true;
    relatedAsset: true;
  };
}>;
