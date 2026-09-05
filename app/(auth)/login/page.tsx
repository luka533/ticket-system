import type { Metadata } from "next";
import LoginForm from "./loginForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage() {
  // if user jwt is already stored, then redirect them to /
  const session = await auth();
  if (session?.user.id) redirect("/");

  return <LoginForm />;
}
