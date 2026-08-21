import React from "react";

interface StatusPillProps {
  status: "New" | "Shortlisted" | "Maybe" | "Rejected" | "Closed" | "Live" | "Rated";
  className?: string;
}

export default function StatusPill({ status, className = "" }: StatusPillProps) {
  const map: Record<string, string> = {
    New: "st-new",
    Shortlisted: "st-short",
    Live: "st-short",
    Rated: "st-short",
    Maybe: "st-closed",
    Closed: "st-closed",
    Rejected: "st-rej",
  };

  const styleClass = map[status] || "st-closed";

  return <span className={`status-pill ${styleClass} ${className}`}>{status}</span>;
}
