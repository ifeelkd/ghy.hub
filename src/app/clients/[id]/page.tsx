"use client";

import React, { use } from "react";
import Link from "next/link";
import { useMarketplace } from "@/lib/store/marketplace-store";
import Badge from "@/components/ui/Badge";
import TrustRatingPanel from "@/components/ui/TrustRatingPanel";

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;
  const { clients } = useMarketplace();

  const client = clients[clientId];

  if (!client) {
    return (
      <main className="container animate-view-in" style={{ paddingBottom: "3rem" }}>
        <Link href="/explore" className="back-link">
          ← Back to projects
        </Link>
        <div className="empty glass" style={{ marginTop: "2rem", borderRadius: "var(--r)" }}>
          <h3>Client not found</h3>
        </div>
      </main>
    );
  }

  const renderFact = (val: boolean | "na", yesText: string, noText: string, naText: string) => {
    if (val === true) {
      return <span className="fact y">{yesText}</span>;
    }
    if (val === false) {
      return <span className="fact n">{noText}</span>;
    }
    return <span className="fact na">{naText}</span>;
  };

  return (
    <main className="animate-view-in">
      <div className="container" style={{ paddingBottom: "3rem" }}>
        <Link href="/explore" className="back-link">
          ← Back to projects
        </Link>

        {/* CLIENT HERO */}
        <div className="detail-hero glass-strong">
          <div className="chip-row">
            <Badge variant="verify">✓ {client.verify}</Badge>
            <Badge variant="unpaid">{client.city}</Badge>
          </div>
          <h1 className="display">{client.org}</h1>
          <p className="lead">
            {client.person} · on Brief since {client.since}
          </p>
        </div>

        {/* RATINGS LIST & SIDEBAR */}
        <div className="detail-grid">
          <div className="panel glass">
            <h3>Ratings from freelancers</h3>
            {client.ratings && client.ratings.length > 0 ? (
              client.ratings.map((r, i) => (
                <div key={i} className="rating-row">
                  <div className="rating-head">
                    <b style={{ fontSize: "0.9rem" }}>{r.by}</b>
                    <span className="score-inline">
                      <span className="n">{r.overall}</span>
                      <em>/ 5 · {r.date}</em>
                    </span>
                  </div>

                  {r.note && (
                    <p style={{ fontSize: "0.88rem", color: "var(--muted)", margin: "0.4rem 0" }}>
                      &ldquo;{r.note}&rdquo;
                    </p>
                  )}

                  <div className="rating-facts">
                    {renderFact(r.responded, "Responded", "No response", "—")}
                    {renderFact(r.described, "As described", "Not as described", "Never started")}
                    {renderFact(r.paid, "Paid as stated", "Not paid as stated", "Payment N/A")}
                  </div>
                </div>
              ))
            ) : (
              <p className="meta" style={{ marginTop: "1rem" }}>
                No freelancer ratings recorded yet.
              </p>
            )}
          </div>

          <div className="sticky-side">
            <TrustRatingPanel rid={clientId} compact />
          </div>
        </div>
      </div>
    </main>
  );
}
