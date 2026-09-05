import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CreateAssetForm from "@/components/assets/createAssetForm";

async function NewAssetPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },

    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Link
        href="/assets"
        className="inline-flex h-8 items-center rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        ← Back to assets
      </Link>

      <CreateAssetForm users={users} />
    </div>
  );
}

export default NewAssetPage;
