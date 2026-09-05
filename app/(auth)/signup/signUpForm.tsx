"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { signUpUser } from "@/lib/actions/user.actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader } from "lucide-react";
import Link from "next/link";

// Button needs to be in a seperate Component for the useFormStatus hook
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs outline-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {pending ? (
        <span>
          <Loader className="animate-spin inline" /> Submitting...
        </span>
      ) : (
        <span>Create Account</span>
      )}
    </button>
  );
}

const inputClasses =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20";

export default function SignUpForm() {
  const [data, signUpAction] = useActionState(signUpUser, undefined);

  return (
    <section className="w-full max-w-104">
      <Card className="gap-0 py-0 shadow-sm">
        <CardHeader className="gap-3 border-b px-6 py-5">
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold tracking-tight">Sign Up</h1>
            <p className="text-sm leading-5 text-muted-foreground">
              Enter your work email and password to continue.
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-5">
          <form action={signUpAction} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="name" className="text-sm font-medium">
                  Fullname
                </label>
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your Fullname"
                required
                className={inputClasses}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="name@company.com"
                required
                className={inputClasses}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password"
                required
                className={inputClasses}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </label>
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your password"
                required
                className={inputClasses}
              />
            </div>

            {data?.status === "error" && (
              <p
                role="alert"
                aria-live="polite"
                className="text-center text-sm text-destructive"
              >
                {data.message}
              </p>
            )}

            <SubmitButton />

            <p className="text-center text-muted-foreground">
              Already have an Account?{" "}
              <Link
                className="text-sm text-primary font-bold inline-block hover:scale-105 "
                href="/login"
              >
                Log In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
