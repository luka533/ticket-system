"use client";

// we need a client component to react to button click
// we could also add a <form> wrapper and button submit but this is better practice

import { Button } from "@/components/ui/button";
import { closeTicket } from "@/lib/actions/ticket.actions";

function CloseTicketButton({ ticketId }: { ticketId: string }) {
  return (
    <Button
      variant="secondary"
      className="ml-auto"
      onClick={() => closeTicket(ticketId)}
    >
      Close ticket
    </Button>
  );
}

export default CloseTicketButton;
