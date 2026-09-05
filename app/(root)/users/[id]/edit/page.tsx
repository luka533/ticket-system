import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getAdminUserById } from "@/lib/actions/user.actions";

import EditUserForm from "@/components/users/editUserForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function EditUserPage({ params }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const user = await getAdminUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Link
        href={`/users/${user.id}`}
        className="inline-flex h-8 items-center rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        ← Back to user
      </Link>

      <EditUserForm
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          room: user.room,
          role: user.role,
        }}
      />
    </div>
  );
}

export default EditUserPage;
