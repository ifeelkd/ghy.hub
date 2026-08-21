"use client";

import React from "react";
import { useMarketplace } from "@/lib/store/marketplace-store";

export default function Toast() {
  const { toasts } = useMarketplace();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          {toast.text}
        </div>
      ))}
    </div>
  );
}
