import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAdminAssetById } from "@/lib/actions/assets.actions";

import EditAssetForm from "@/components/assets/editAssetForm";

async function EditAssetPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const [asset, users] = await Promise.all([
    getAdminAssetById(id),

    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },

      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!asset) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Link
        href={`/assets/${asset.id}`}
        className="inline-flex h-8 items-center rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        ← Back to asset
      </Link>

      <EditAssetForm
        asset={{
          id: asset.id,
          type: asset.type,
          manufacturer: asset.manufacturer,
          model: asset.model,
          serialNumber: asset.serialNumber,
          status: asset.status,
          assignedToId: asset.assignedTo?.id ?? null,
        }}
        users={users}
      />
    </div>
  );
}

export default EditAssetPage;
