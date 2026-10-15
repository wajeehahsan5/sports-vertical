"use client";

import { useState } from "react";
import { postLead, type Booking } from "@/components/audit/api";
import BookingStep from "@/components/audit/BookingStep";
import { formatWhen } from "@/components/audit/when";

/** The audit's booking step on its own, for athletes who come back from an email. */
export default function BookPanel(props: { leadId: string; name: string; email: string; whatsapp: string; instagram: string }) {
  const [booking, setBooking] = useState<Booking | null>(null);

  async function handleBooked(b: Booking) {
    if (booking) return;
    setBooking(b);
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await postLead({ action: "booked", id: props.leadId, booking: b });
        return;
      } catch {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
  }

  if (booking) {
    return (
      <div className="card p-6 sm:p-8">
        <p className="label text-fg-dim">Booked</p>
        <p className="display mt-2 text-[clamp(28px,5vw,40px)]">{formatWhen(booking.startTime)}</p>
        <p className="mt-3 text-[17px] text-fg-body">
          The invite is on its way. Before the call we go through your profiles and bring 3 fixes.
        </p>
      </div>
    );
  }

  return <BookingStep {...props} onBooked={handleBooked} />;
}
