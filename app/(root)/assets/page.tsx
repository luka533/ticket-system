import { redirect } from "next/navigation";

import { auth } from "@/auth";

import UserAssetsPage from "@/components/assets/userAssetsPage";
import AdminSupportAssetsPage from "@/components/assets/adminSupportAssetsPage";

type Props = {
  searchParams: Promise<{
    search?: string;
    type?: string;
    status?: string;
    page?: string;
  }>;
};

// we need to pass in searchparams because only route components get access to it
async function AssetsOverviewPage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "USER") {
    return <UserAssetsPage />;
  }

  if (session.user.role === "SUPPORT" || session.user.role === "ADMIN") {
    return (
      <AdminSupportAssetsPage
        searchParams={searchParams}
        role={session.user.role}
      />
    );
  }

  redirect("/");
}

export default AssetsOverviewPage;
