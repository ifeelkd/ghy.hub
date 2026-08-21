"use client";

import React from "react";
import Link from "next/link";
import { useMarketplace } from "@/lib/store/marketplace-store";
import StatusPill from "@/components/ui/StatusPill";
import TrustRatingPanel from "@/components/ui/TrustRatingPanel";

export default function ClientDashboardPage() {
  const { session, projects, clients, aggregateRatings, applicantLanes } = useMarketplace();

  const rid = session?.rid || "brightloop";
  const client = clients[rid] || clients.brightloop;
  const clientProjects = projects.filter((p) => p.rid === rid);
  const aggregate = aggregateRatings(rid);

  const totalApplications =
    (applicantLanes.new?.length || 0) +
    (applicantLanes.short?.length || 0) +
    (applicantLanes.maybe?.length || 0) +
    (applicantLanes.rej?.length || 0);

  const shortlistedCount = applicantLanes.short?.length || 0;

  return (
    <main className="animate-view-in">
      <div className="container" style={{ paddingBottom: "3rem" }}>
        <div
          style={{
            paddingTop: "1.2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span className="eyebrow">Dashboard</span>
            <h1 className="display" style={{ fontSize: "clamp(1.9rem, 4vw, 2.7rem)" }}>
              {client.org}
            </h1>
            <p className="meta" style={{ marginTop: "0.3rem" }}>
              {client.verify} · on Brief since {client.since}
            </p>
          </div>

          <Link href="/post-project" className="btn btn-primary btn-sm">
            Post a project
          </Link>
        </div>

        {/* STATS */}
        <div className="stat-grid">
          <div className="stat glass">
            <b>{clientProjects.length}</b>
            <span>Live projects</span>
          </div>
          <div className="stat glass">
            <b>{totalApplications}</b>
            <span>Total applications</span>
          </div>
          <div className="stat glass">
            <b>{shortlistedCount}</b>
            <span>Shortlisted</span>
          </div>
          <div className="stat glass">
            <b>{aggregate.n > 0 ? aggregate.avg : "—"}</b>
            <span>Your trust score</span>
          </div>
        </div>

        {/* PROJECTS LIST */}
        <h3
          style={{
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--faint)",
            margin: "1.6rem 0 0.8rem",
          }}
        >
          Your active projects
        </h3>

        {clientProjects.length > 0 ? (
          clientProjects.map((p) => (
            <div key={p.id} className="row-item glass">
              <div className="grow">
                <h4>{p.role}</h4>
                <p className="meta">
                  {p.project} · Closes {p.deadline}
                </p>
              </div>

              <div className="row-actions">
                <StatusPill status="New" />
                <Link href="/board" className="mini act">
                  Applications board
                </Link>
                <Link href={`/projects/${p.id}`} className="mini">
                  View listing
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="empty glass" style={{ borderRadius: "var(--r)" }}>
            <b>No projects posted yet.</b>
            <br />
            Use the Post a project button to publish your first brief.
          </div>
        )}

        {/* REPUTATION CARD */}
        <div style={{ marginTop: "1.6rem" }}>
          <TrustRatingPanel rid={rid} />
        </div>
      </div>
    </main>
  );
}
