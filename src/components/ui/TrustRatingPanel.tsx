"use client";

import React from "react";
import Link from "next/link";
import { useMarketplace } from "@/lib/store/marketplace-store";
import Badge from "./Badge";

interface TrustRatingPanelProps {
  rid: string;
  compact?: boolean;
}

export default function TrustRatingPanel({ rid, compact = false }: TrustRatingPanelProps) {
  const { clients, aggregateRatings } = useMarketplace();
  const client = clients[rid];
  const aggregate = aggregateRatings(rid);

  if (!client) return null;

  const renderMetricRow = (label: string, val: number | null, cnt: number) => {
    if (val === null) {
      return (
        <div className="metric">
          <span>{label}</span>
          <b style={{ color: "var(--faint)" }}>No data</b>
        </div>
      );
    }
    return (
      <div className="metric">
        <span>{label}</span>
        <b>{val}%</b>
        <div className="bar">
          <i className={val < 70 ? "low" : ""} style={{ width: `${val}%` }}></i>
        </div>
        <span className="meta" style={{ gridColumn: "1/-1" }}>
          from {cnt} rating{cnt === 1 ? "" : "s"}
        </span>
      </div>
    );
  };

  return (
    <div className="panel glass">
      <h3>Client</h3>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <b style={{ fontSize: "1rem" }}>{client.org}</b>
          <p className="meta">
            {client.person} · on Brief since {client.since}
          </p>
          <div className="chip-row" style={{ marginTop: "0.5rem" }}>
            <Badge variant="verify">✓ {client.verify}</Badge>
          </div>
        </div>

        {aggregate.n > 0 && (
          <div className="score-lg">
            <b>{aggregate.avg}</b>
            <span>/ 5 · {aggregate.n}</span>
          </div>
        )}
      </div>

      {aggregate.n === 0 ? (
        <p className="meta" style={{ marginTop: "0.9rem" }}>
          No freelancer ratings yet. This client has not been rated on Brief.
        </p>
      ) : (
        <div style={{ marginTop: "1rem" }}>
          {renderMetricRow("Responded to applications", aggregate.responded, aggregate.respN)}
          {renderMetricRow("Project as described", aggregate.described, aggregate.descN)}
          {renderMetricRow("Paid as stated", aggregate.paid, aggregate.paidN)}
        </div>
      )}

      {!compact && aggregate.n > 0 && (
        <Link
          href={`/clients/${rid}`}
          className="btn btn-ghost btn-sm"
          style={{ marginTop: "1rem", width: "100%" }}
        >
          Read {aggregate.n} rating{aggregate.n === 1 ? "" : "s"}
        </Link>
      )}
    </div>
  );
}
