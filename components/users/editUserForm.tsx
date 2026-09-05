"use client";

import { useRouter } from "next/navigation";

import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import * as z from "zod";

import { updateUser } from "@/lib/actions/user.actions";
import { updateUserSchema } from "@/lib/validators";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";

type FormValues = z.infer<typeof updateUserSchema>;

type User = {
  id: string;
  name: string;
  email: string;
  room: string | null;

  role: "USER" | "SUPPORT" | "ADMIN";
};

function EditUserForm({ user }: { user: User }) {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(updateUserSchema),

    defaultValues: {
      name: user.name,
      email: user.email,
      room: user.room ?? "",
      role: user.role,
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      await updateUser(user.id, data);

      toast.success("User updated successfully.");

      router.push(`/users/${user.id}`);
      router.refresh();
    } catch (err) {
      toast.error((err as Error)?.message || "Could not update user.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit User</CardTitle>

        <CardDescription>
          Update account information and permissions.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="edit-user-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>

                  <Input
                    {...field}
                    id="name"
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Email */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>

                  <Input
                    {...field}
                    id="email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                  />

                  <FieldDescription>
                    Used to sign in to the account.
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Room */}
            <Controller
              name="room"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="room">Room</FieldLabel>

                  <Input
                    {...field}
                    id="room"
                    placeholder="e.g. 204"
                    aria-invalid={fieldState.invalid}
                  />

                  <FieldDescription>
                    Optional office or room location.
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Role */}
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="role">Role</FieldLabel>

                  <select
                    id="role"
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                  >
                    <option value="USER">User</option>

                    <option value="SUPPORT">Support</option>

                    <option value="ADMIN">Admin</option>
                  </select>

                  <FieldDescription>
                    Controls what the user can access and manage.
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={form.formState.isSubmitting}
        >
          Reset
        </Button>

        <Button
          type="submit"
          form="edit-user-form"
          // prevent double submission and also prevent submission if no changes have been made
          disabled={form.formState.isSubmitting || !form.formState.isDirty}
        >
          {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default EditUserForm;
