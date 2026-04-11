"use client";

import { useEffect } from "react";
import { apiFetch } from "@/lib/api";

const LS_KEY = "ow_tz";

export default function TimezoneDetector({ authToken }: { authToken: string }) {
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!detected || detected === "UTC") return;

    const stored = localStorage.getItem(LS_KEY);
    if (stored === detected) return; // already in sync

    apiFetch("/users/me", {
      method: "PATCH",
      token: authToken,
      body: JSON.stringify({ timezone: detected }),
    })
      .then(() => localStorage.setItem(LS_KEY, detected))
      .catch(() => {});
  }, [authToken]);

  return null;
}
