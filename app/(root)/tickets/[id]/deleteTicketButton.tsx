"use client";

// we need a client component to react to button click
// we could also add a <form> wrapper and button submit but this is better practice

import { Button } from "@/components/ui/button";
import { assignTicketToMe } from "@/lib/actions/ticket.actions";

function DeleteTicketButton({ ticketId }: { ticketId: string }) {
  return (
    <Button
      variant="destructive"
      className="ml-auto"
      onClick={() => assignTicketToMe(ticketId)}
    >
      Delete Ticket
    </Button>
  );
}

export default DeleteTicketButton;
