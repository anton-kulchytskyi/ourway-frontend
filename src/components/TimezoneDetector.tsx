"use client";

import { useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function TimezoneDetector({
  authToken,
  userId,
  currentTimezone,
}: {
  authToken: string;
  userId: number;
  currentTimezone: string;
}) {
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!detected) return;

    // Key is per-user so a new account never inherits a previous account's cached value
    const lsKey = `ow_tz_${userId}`;
    const stored = localStorage.getItem(lsKey);
    if (stored === detected) return; // browser tz hasn't changed since last sync

    // DB already has the right value — just update localStorage and skip the PATCH
    if (currentTimezone === detected) {
      localStorage.setItem(lsKey, detected);
      return;
    }

    apiFetch("/users/me", {
      method: "PATCH",
      token: authToken,
      body: JSON.stringify({ timezone: detected }),
    })
      .then(() => localStorage.setItem(lsKey, detected))
      .catch(() => {});
  }, [authToken, userId, currentTimezone]);

  return null;
}
