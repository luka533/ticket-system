import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAdminUsers } from "@/lib/actions/user.actions";

type RoleFilter = "all" | "USER" | "SUPPORT" | "ADMIN";

type Props = {
  searchParams: Promise<{
    search?: string;
    role?: string;
    page?: string;
  }>;
};

const roles: {
  value: RoleFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "USER", label: "Users" },
  { value: "SUPPORT", label: "Support" },
  { value: "ADMIN", label: "Admins" },
];

async function UsersOverviewPage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;

  const search = params.search?.trim() ?? "";

  const role = roles.some((item) => item.value === params.role)
    ? (params.role as RoleFilter)
    : "all";

  const page = Math.max(Number(params.page) || 1, 1);

  const result = await getAdminUsers({
    search,
    role,
    page,
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage employees, roles and assigned resources.
        </p>
      </div>

      {/* Search */}
      <form action="/users" method="GET" className="flex max-w-lg gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search name"
          className="h-9 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
        />

        {role !== "all" && <input type="hidden" name="role" value={role} />}

        <button
          type="submit"
          className="h-9 rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          Search
        </button>
      </form>

      {/* Role filters */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {roles.map((item) => (
          <Link
            key={item.value}
            href={buildUsersHref({
              role: item.value,
              search,
            })}
            className={`rounded-md border px-3 py-2 text-sm transition-colors ${
              role === item.value
                ? "bg-foreground text-background"
                : "hover:bg-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Employees</h2>

        <p className="text-xs text-muted-foreground">
          {result.userCount} {result.userCount === 1 ? "user" : "users"}
        </p>
      </div>

      {/* Users */}
      {result.users.length > 0 ? (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>

                  <th className="px-4 py-3 font-medium">Role</th>

                  <th className="px-4 py-3 font-medium">Room</th>

                  <th className="px-4 py-3 text-center font-medium">Assets</th>

                  <th className="px-4 py-3 text-center font-medium">
                    In Progress
                  </th>

                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {result.users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b last:border-b-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{user.name}</p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {user.room ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {user._count.assets}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {user._count.assignedTickets}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/users/${user.id}`}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm font-medium">No users found</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Try changing your search or role filter.
          </p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {result.page} of {Math.max(result.totalPages, 1)}
        </p>

        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={buildUsersHref({
                role,
                search,
                page: page - 1,
              })}
              className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              Previous
            </Link>
          )}

          {page < result.totalPages && (
            <Link
              href={buildUsersHref({
                role,
                search,
                page: page + 1,
              })}
              className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: "USER" | "SUPPORT" | "ADMIN" }) {
  const label =
    role === "SUPPORT" ? "Support" : role === "ADMIN" ? "Admin" : "User";

  return (
    <span className="inline-flex rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
      {label}
    </span>
  );
}

function buildUsersHref({
  role = "all",
  search = "",
  page,
}: {
  role?: RoleFilter;
  search?: string;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (role !== "all") {
    params.set("role", role);
  }

  if (search) {
    params.set("search", search);
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/users?${query}` : "/users";
}

export default UsersOverviewPage;
