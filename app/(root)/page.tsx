import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import SupportDashboard from "@/components/dashboard/supportDashboard";
import AdminDashboard from "@/components/dashboard/adminDashboard";
import UserDashboard from "@/components/dashboard/userDashboard";
import { getCurrentUser } from "@/lib/actions/user.actions";

export const metadata: Metadata = {
  title: "Home",
};

// Dashboard for different user roles
async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // SUPPORT sees unassigned tickets + assigned tickets
  if (session.user.role === "SUPPORT") return <SupportDashboard />;

  // sees system overview + assets + open tickets
  if (session.user.role === "ADMIN") return <AdminDashboard />;

  // USER sees own tickets + own assets

  const user = await getCurrentUser(session.user.id);

  return <UserDashboard user={user} />;
}

export default HomePage;
