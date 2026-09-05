import type { Metadata } from "next";
import SignUpForm from "./signUpForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function SignUpPage() {
  // if user jwt is already stored, then redirect them to /
  const session = await auth();
  if (session?.user.id) redirect("/");

  return <SignUpForm />;
}
