/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatError(error: any) {
  if (error.name === "ZodError") {
    const errors = error.issues.map((err: any) => err.message);
    return errors.join(". ");
  } else if (error.name === "PrismaClientKnownRequestError") {
    // The .code property can be accessed in a type-safe manner
    if (error.code === "P2002") {
      const field = error.meta?.target ? error.meta.target[0] : "Field";
      return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }
  } else {
    return error.message || "An unexpected error occurred";
  }
}

export function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/////// for assets page //////

// all types just like in schema, but "all" was added to
export type TypeFilter =
  | "all"
  | "LAPTOP"
  | "DESKTOP"
  | "MONITOR"
  | "PRINTER"
  | "PHONE"
  | "OTHER";

// just like in typefilter we added all
export type StatusFilter =
  | "all"
  | "AVAILABLE"
  | "IN_USE"
  | "REPAIR"
  | "RETIRED";

export const types: {
  value: TypeFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "LAPTOP", label: "Laptops" },
  { value: "DESKTOP", label: "Desktops" },
  { value: "MONITOR", label: "Monitors" },
  { value: "PRINTER", label: "Printers" },
  { value: "PHONE", label: "Phones" },
  { value: "OTHER", label: "Other" },
];

export const statuses: {
  value: StatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "AVAILABLE", label: "Available" },
  { value: "IN_USE", label: "In Use" },
  { value: "REPAIR", label: "Repair" },
  { value: "RETIRED", label: "Retired" },
];

export function buildAssetsHref({
  type = "all",
  status = "all",
  search = "",
  page,
}: {
  type?: TypeFilter;
  status?: StatusFilter;
  search?: string;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (type !== "all") {
    params.set("type", type);
  }

  if (status !== "all") {
    params.set("status", status);
  }

  if (search) {
    params.set("search", search);
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/assets?${query}` : "/assets";
}
