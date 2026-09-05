"use client";

// we need a client component to react to button click
// we could also add a <form> wrapper and button submit but this is better practice

import { Button } from "@/components/ui/button";
import { cancelTicket } from "@/lib/actions/ticket.actions";

function CancelTicketButton({ ticketId }: { ticketId: string }) {
  return (
    <Button
      variant="destructive"
      className="ml-auto"
      onClick={() => cancelTicket(ticketId)}
    >
      Cancel ticket
    </Button>
  );
}

export default CancelTicketButton;
