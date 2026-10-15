"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Audit } from "./Audit";

/**
 * The audit, full-screen. Every link to #audit opens it (captured before the page's
 * smooth-scroll handler sees the click); ✕, Escape and the phone's back button close it.
 * It stays mounted while closed, so answers survive closing and reopening.
 */
export function AuditOverlay() {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const pushed = useRef(false);

  const show = useCallback((from: HTMLElement | null) => {
    opener.current = from;
    setOpen(true);
    if (location.hash !== "#audit") {
      history.pushState({ audit: true }, "", "#audit");
      pushed.current = true;
    }
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    // Undo our own history entry so Back doesn't reopen it; otherwise just drop the hash.
    if (pushed.current) {
      pushed.current = false;
      history.back();
    } else if (location.hash === "#audit") {
      history.replaceState(null, "", location.pathname + location.search);
    }
    opener.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href="#audit"]');
      if (!link) return;
      e.preventDefault();
      show(link);
    };
    const onPop = () => {
      if (location.hash !== "#audit") {
        pushed.current = false;
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    // Arriving on /#audit (a partner link, a reload mid-audit) opens it straight away.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off read of the landing URL
    if (location.hash === "#audit") setOpen(true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
  }, [show]);

  useEffect(() => {
    const root = document.documentElement;
    if (!open) {
      root.removeAttribute("data-quiz-open");
      return;
    }
    root.setAttribute("data-quiz-open", "");
    const t = window.setTimeout(() => document.getElementById("audit-title")?.focus({ preventScroll: true }), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, hide]);

  return (
    <div
      id="audit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-title"
      hidden={!open}
      className="quiz-in fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-paper"
    >
      <Audit onClose={hide} />
    </div>
  );
}
