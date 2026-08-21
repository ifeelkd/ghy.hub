import React from "react";

interface BadgeProps {
  variant?: "verify" | "paid" | "unpaid" | "warn";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = "unpaid", children, className = "" }: BadgeProps) {
  const variantClass = {
    verify: "b-verify",
    paid: "b-paid",
    unpaid: "b-unpaid",
    warn: "b-warn",
  }[variant];

  return (
    <span className={`badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
