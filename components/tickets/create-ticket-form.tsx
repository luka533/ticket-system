"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import type { Asset } from "@/lib/generated/prisma/client";

import { insertTicketSchema } from "@/lib/validators";
import { createTicket } from "@/lib/actions/ticket.actions";

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

import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

type FormValues = z.infer<typeof insertTicketSchema>;

function CreateTicketForm({ assets }: { assets: Asset[] }) {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(insertTicketSchema),

    defaultValues: {
      title: "",
      description: "",
      relatedAssetId: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      const ticket = await createTicket(data);

      toast.success("Ticket created successfully.");

      router.push(`/tickets/${ticket.id}`);
      router.refresh();
    } catch (error) {
      toast.error("Could not create ticket.");
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/tickets"
        className="inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to tickets
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create Ticket</CardTitle>

          <CardDescription>
            Describe your issue or request and IT support will take care of it.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="create-ticket-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {/* Title */}
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ticket-title">Title</FieldLabel>

                    <Input
                      {...field}
                      id="ticket-title"
                      placeholder="Laptop screen is flickering"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                    />

                    <FieldDescription>
                      Give your ticket a short and clear title.
                    </FieldDescription>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Description */}
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ticket-description">
                      Description
                    </FieldLabel>

                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="ticket-description"
                        placeholder="Describe the problem or request in more detail..."
                        rows={6}
                        className="min-h-28 resize-none"
                        aria-invalid={fieldState.invalid}
                      />

                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.value.length}/1000 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>

                    <FieldDescription>
                      Include information that could help support understand the
                      problem.
                    </FieldDescription>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Asset */}
              <Controller
                name="relatedAssetId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="related-asset">
                      Related asset
                    </FieldLabel>

                    <select
                      id="related-asset"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                    >
                      <option value="">No related asset</option>

                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          ASSET-
                          {String(asset.assetNumber).padStart(4, "0")} ·{" "}
                          {asset.manufacturer} {asset.model}
                        </option>
                      ))}
                    </select>

                    <FieldDescription>
                      Select one of your company devices if the ticket concerns
                      that device.
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
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>

          <Button
            type="submit"
            form="create-ticket-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating..." : "Create Ticket"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default CreateTicketForm;
