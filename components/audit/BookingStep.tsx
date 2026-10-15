"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useRef } from "react";
import type { Booking } from "./api";

const NAMESPACE = "brand-audit";
type CalApi = (method: string, arg?: unknown) => void;
type BookingEvent = { detail: { data: { uid?: string; startTime?: string } } };

/**
 * The last step: Cal.com inline. Minimum notice lives on the Cal.com event type
 * itself, not here. The lead row already exists before this loads.
 */
export default function BookingStep({
  name,
  email,
  whatsapp,
  instagram,
  leadId,
  onBooked,
}: {
  name: string;
  email: string;
  whatsapp: string;
  instagram: string;
  leadId: string;
  onBooked: (b: Booking) => void;
}) {
  const calLink = process.env.NEXT_PUBLIC_CAL_LINK;
  const calOrigin = process.env.NEXT_PUBLIC_CAL_ORIGIN || undefined;
  const onBookedRef = useRef(onBooked);

  useEffect(() => {
    onBookedRef.current = onBooked;
  }, [onBooked]);

  useEffect(() => {
    if (!calLink) return;
    let cal: CalApi | null = null;
    let cancelled = false;
    const callback = (e: BookingEvent) => {
      const { uid, startTime } = e.detail.data;
      if (startTime) onBookedRef.current({ uid: uid ?? "", startTime });
    };

    getCalApi({ namespace: NAMESPACE }).then((api) => {
      if (cancelled) return;
      cal = api as unknown as CalApi;
      // Theme from the tokens, read at runtime so every colour still traces to tokens.css.
      const css = getComputedStyle(document.documentElement);
      const t = (v: string) => css.getPropertyValue(v).trim();
      cal("ui", {
        theme: "light",
        layout: "month_view",
        hideEventTypeDetails: true,
        cssVarsPerTheme: {
          light: {
            "cal-brand": t("--ink"),
            "cal-brand-emphasis": t("--ink-2"),
            "cal-brand-text": t("--mint"),
            "cal-text": t("--ink"),
            "cal-text-emphasis": t("--ink"),
            "cal-text-subtle": t("--dim"),
            "cal-bg": t("--card"),
            "cal-bg-emphasis": t("--paper"),
            "cal-bg-subtle": t("--paper"),
            "cal-border": t("--line"),
            "cal-border-subtle": t("--sand"),
          },
        },
      });
      cal("on", { action: "bookingSuccessfulV2", callback });
    });

    return () => {
      cancelled = true;
      cal?.("off", { action: "bookingSuccessfulV2", callback });
    };
  }, [calLink]);

  if (!calLink) {
    return (
      <div className="rounded-[14px] border border-dashed border-line bg-card p-6">
        <p className="label text-dim">TODO · Cal.com not connected</p>
        <p className="mt-2 text-[16px] text-body">
          Set <code className="font-semibold">NEXT_PUBLIC_CAL_LINK</code> in <code>.env.local</code> and the booking calendar
          loads here, prefilled with {name || "their name"} and {email || "their email"}.
        </p>
        {process.env.NODE_ENV !== "production" ? (
          <button
            type="button"
            className="btn btn-ink mt-5"
            onClick={() =>
              onBooked({ uid: `dev-${Date.now()}`, startTime: new Date(Date.now() + 3 * 86_400_000).toISOString() })
            }
          >
            Simulate a booking (dev only)
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-h-[560px] overflow-hidden rounded-[14px] border border-line bg-card">
      <Cal
        namespace={NAMESPACE}
        calLink={calLink}
        calOrigin={calOrigin}
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
        config={
          {
            layout: "month_view",
            useSlotsViewOnSmallScreen: "true",
            theme: "light",
            // Everything the audit already asked, so the Cal form is one tap: Confirm.
            name,
            email,
            ...(whatsapp.startsWith("+") ? { attendeePhoneNumber: whatsapp.replace(/[^\d+]/g, "") } : {}),
            notes: `Instagram @${instagram} (via the brand audit)`,
            "metadata[leadId]": leadId,
          } as React.ComponentProps<typeof Cal>["config"]
        }
      />
    </div>
  );
}
