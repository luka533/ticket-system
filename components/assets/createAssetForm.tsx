"use client";

import { Controller, useForm } from "react-hook-form";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import * as z from "zod";

import { createAsset } from "@/lib/actions/assets.actions";
import { insertAssetSchema } from "@/lib/validators";

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

type FormValues = z.infer<typeof insertAssetSchema>;

type UserOption = {
  id: string;
  name: string;
  email: string;
};

function CreateAssetForm({ users }: { users: UserOption[] }) {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(insertAssetSchema),

    defaultValues: {
      type: "LAPTOP",
      manufacturer: "",
      model: "",
      serialNumber: "",
      status: "AVAILABLE",
      assignedToId: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      const asset = await createAsset(data);

      toast.success("Asset created successfully.");

      router.push(`/assets/${asset.id}`);

      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }

      toast.error("Could not create asset.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Asset</CardTitle>

        <CardDescription>
          Add a new company device to the asset inventory.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="create-asset-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Type */}
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="type">Type</FieldLabel>

                  <select
                    id="type"
                    value={field.value}
                    onChange={field.onChange}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                  >
                    <option value="LAPTOP">Laptop</option>

                    <option value="DESKTOP">Desktop</option>

                    <option value="MONITOR">Monitor</option>

                    <option value="PRINTER">Printer</option>

                    <option value="PHONE">Phone</option>

                    <option value="OTHER">Other</option>
                  </select>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Manufacturer */}
            <Controller
              name="manufacturer"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="manufacturer">Manufacturer</FieldLabel>

                  <Input
                    {...field}
                    id="manufacturer"
                    placeholder="Lenovo"
                    aria-invalid={fieldState.invalid}
                  />

                  <FieldDescription>
                    Device manufacturer or brand.
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Model */}
            <Controller
              name="model"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="model">Model</FieldLabel>

                  <Input
                    {...field}
                    id="model"
                    placeholder="ThinkPad T14"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Serial Number */}
            <Controller
              name="serialNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="serialNumber">Serial Number</FieldLabel>

                  <Input
                    {...field}
                    id="serialNumber"
                    placeholder="PF4ABC123"
                    aria-invalid={fieldState.invalid}
                  />

                  <FieldDescription>
                    Optional manufacturer serial number.
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Status */}
            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="status">Status</FieldLabel>

                  <select
                    id="status"
                    value={field.value}
                    onChange={field.onChange}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                  >
                    <option value="AVAILABLE">Available</option>

                    <option value="IN_USE">In Use</option>

                    <option value="REPAIR">Repair</option>

                    <option value="RETIRED">Retired</option>
                  </select>

                  <FieldDescription>
                    Current state of the device.
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Assigned User */}
            <Controller
              name="assignedToId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assignedTo">Assigned User</FieldLabel>

                  <select
                    id="assignedTo"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                  >
                    <option value="">Unassigned</option>

                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} · {user.email}
                      </option>
                    ))}
                  </select>

                  <FieldDescription>
                    Optional employee currently using this asset.
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
          form="create-asset-form"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Creating..." : "Create Asset"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default CreateAssetForm;
