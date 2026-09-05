import Link from "next/link";

import { getAllAssets } from "@/lib/actions/assets.actions";

import {
  buildAssetsHref,
  statuses,
  types,
  type StatusFilter,
  type TypeFilter,
} from "@/lib/utils";

type Props = {
  role: "SUPPORT" | "ADMIN";

  searchParams: Promise<{
    search?: string;
    type?: string;
    status?: string;
    page?: string;
  }>;
};

async function AdminSupportAssetsPage({ searchParams, role }: Props) {
  const params = await searchParams;

  const search = params.search?.trim() ?? "";

  // if no filter matches with types then assign it "all"
  const type = types.some((item) => item.value === params.type)
    ? (params.type as TypeFilter)
    : "all";

  // if no status matches with types then assign it "all"
  const status = statuses.some((item) => item.value === params.status)
    ? (params.status as StatusFilter)
    : "all";

  // min page is 1 (so no negative allowed)
  const page = Math.max(Number(params.page) || 1, 1);

  const result = await getAllAssets({
    search,
    type,
    status,
    page,
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage company devices and assignments.
          </p>
        </div>

        {role === "ADMIN" && (
          <Link
            href="/assets/new"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            New Asset
          </Link>
        )}
      </div>

      {/* Search */}
      <form action="/assets" method="GET" className="flex max-w-lg gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search manufacturer, model or serial number"
          className="h-9 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
        />

        {type !== "all" && <input type="hidden" name="type" value={type} />}

        {status !== "all" && (
          <input type="hidden" name="status" value={status} />
        )}

        <button
          type="submit"
          className="h-9 rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          Search
        </button>
      </form>

      {/* Type filters */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Type</p>

        <div className="flex flex-wrap gap-2">
          {types.map((item) => (
            <Link
              key={item.value}
              href={buildAssetsHref({
                type: item.value,
                status,
                search,
              })}
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                type === item.value
                  ? "bg-foreground text-background"
                  : "hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Status filters */}
      <div className="border-b pb-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Status</p>

        <div className="flex flex-wrap gap-2">
          {statuses.map((item) => (
            <Link
              key={item.value}
              href={buildAssetsHref({
                type,
                status: item.value,
                search,
              })}
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                status === item.value
                  ? "bg-foreground text-background"
                  : "hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Company Assets</h2>

        <p className="text-xs text-muted-foreground">
          {result.assetCount} {result.assetCount === 1 ? "asset" : "assets"}
        </p>
      </div>

      {/* Assets */}
      {result.assets.length > 0 ? (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Asset</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Assigned To</th>
                  <th className="px-4 py-3 font-medium">Serial Number</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {result.assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="border-b last:border-b-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {asset.manufacturer} {asset.model}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        ASSET-{String(asset.assetNumber).padStart(4, "0")}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <AssetTypeBadge type={asset.type} />
                    </td>

                    <td className="px-4 py-3">
                      <AssetStatusBadge status={asset.status} />
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {asset.assignedTo?.name ?? "Unassigned"}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {asset.serialNumber ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/assets/${asset.id}`}
                        className="font-medium text-muted-foreground transition-colors hover:text-foreground"
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
          <p className="text-sm font-medium">No assets found</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Try changing your search or filters.
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
              href={buildAssetsHref({
                type,
                status,
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
              href={buildAssetsHref({
                type,
                status,
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

function AssetTypeBadge({
  type,
}: {
  type: "LAPTOP" | "DESKTOP" | "MONITOR" | "PRINTER" | "PHONE" | "OTHER";
}) {
  const label = type.charAt(0) + type.slice(1).toLowerCase();

  return (
    <span className="inline-flex rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
      {label}
    </span>
  );
}

function AssetStatusBadge({
  status,
}: {
  status: "AVAILABLE" | "IN_USE" | "REPAIR" | "RETIRED";
}) {
  const label =
    status === "IN_USE"
      ? "In Use"
      : status === "AVAILABLE"
        ? "Available"
        : status === "REPAIR"
          ? "Repair"
          : "Retired";

  return (
    <span className="inline-flex rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
      {label}
    </span>
  );
}

export default AdminSupportAssetsPage;
