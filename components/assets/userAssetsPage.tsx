import Link from "next/link";

import { getCurrentUserAssets } from "@/lib/actions/assets.actions";

async function UserAssetsPage() {
  const assets = await getCurrentUserAssets();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Assets</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Company devices currently assigned to you.
        </p>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-sm font-semibold">Assigned Devices</h2>

        <p className="text-xs text-muted-foreground">
          {assets.length} {assets.length === 1 ? "asset" : "assets"}
        </p>
      </div>

      {/* Assets */}
      {assets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {assets.map((asset) => (
            <Link
              key={asset.id}
              href={`/assets/${asset.id}`}
              className="rounded-lg border p-5 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {asset.manufacturer} {asset.model}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    ASSET-
                    {String(asset.assetNumber).padStart(4, "0")}
                  </p>
                </div>

                <AssetStatusBadge status={asset.status} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <Info label="Type" value={formatAssetType(asset.type)} />

                <Info
                  label="Serial Number"
                  value={asset.serialNumber ?? "Not provided"}
                />
              </div>

              <p className="mt-5 text-xs font-medium text-muted-foreground">
                View asset details →
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm font-medium">No assigned assets</p>

          <p className="mt-1 text-sm text-muted-foreground">
            You currently have no company devices assigned to your account.
          </p>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function AssetStatusBadge({
  status,
}: {
  status: "AVAILABLE" | "IN_USE" | "REPAIR" | "RETIRED";
}) {
  return (
    <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
      {formatAssetStatus(status)}
    </span>
  );
}

function formatAssetStatus(status: string) {
  if (status === "IN_USE") {
    return "In Use";
  }

  if (status === "REPAIR") {
    return "Repair";
  }

  if (status === "RETIRED") {
    return "Retired";
  }

  return "Available";
}

function formatAssetType(type: string) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export default UserAssetsPage;
