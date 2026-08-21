"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMarketplace } from "@/lib/store/marketplace-store";
import StatusPill from "@/components/ui/StatusPill";

export default function AdminPage() {
  const { verifQueue, reportsQueue, projects, clients, adminAction } = useMarketplace();
  const [activeTab, setActiveTab] = useState<"verif" | "reports" | "listings">("verif");

  return (
    <main className="animate-view-in">
      <div className="container" style={{ paddingBottom: "3rem" }}>
        <div style={{ paddingTop: "1.2rem" }}>
          <span className="eyebrow">Moderation &amp; Trust</span>
          <h1 className="display" style={{ fontSize: "clamp(1.9rem, 4vw, 2.7rem)" }}>
            Admin portal
          </h1>
        </div>

        {/* STATS */}
        <div className="stat-grid">
          <div className="stat glass">
            <b>{verifQueue.length}</b>
            <span>Awaiting verification</span>
          </div>
          <div className="stat glass">
            <b>{reportsQueue.length}</b>
            <span>Open reports</span>
          </div>
          <div className="stat glass">
            <b>{projects.length}</b>
            <span>Live listings</span>
          </div>
          <div className="stat glass">
            <b>{Object.keys(clients).length}</b>
            <span>Client accounts</span>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          <button
            type="button"
            className={`tab ${activeTab === "verif" ? "sel" : ""}`}
            onClick={() => setActiveTab("verif")}
          >
            Verification queue ({verifQueue.length})
          </button>
          <button
            type="button"
            className={`tab ${activeTab === "reports" ? "sel" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            Community reports ({reportsQueue.length})
          </button>
          <button
            type="button"
            className={`tab ${activeTab === "listings" ? "sel" : ""}`}
            onClick={() => setActiveTab("listings")}
          >
            All listings ({projects.length})
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div style={{ marginTop: "1rem" }}>
          {/* VERIFICATION QUEUE */}
          {activeTab === "verif" && (
            <div>
              {verifQueue.length > 0 ? (
                verifQueue.map((item, i) => (
                  <div key={item.id} className="row-item glass">
                    <div className="grow">
                      <h4>{item.who}</h4>
                      <p className="meta">
                        {item.org} · {item.docs} · {item.when}
                      </p>
                    </div>

                    <div className="row-actions">
                      <button
                        className="mini act"
                        onClick={() => adminAction(i, "verif", "approved")}
                      >
                        Approve badge
                      </button>
                      <button
                        className="mini"
                        onClick={() => adminAction(i, "verif", "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty glass" style={{ borderRadius: "var(--r)" }}>
                  <b>Verification queue clear.</b>
                  <p className="meta">All identity and organisation documents have been reviewed.</p>
                </div>
              )}
            </div>
          )}

          {/* REPORTS QUEUE */}
          {activeTab === "reports" && (
            <div>
              {reportsQueue.length > 0 ? (
                reportsQueue.map((report, i) => (
                  <div key={report.id} className="row-item glass">
                    <div className="grow">
                      <h4>{report.what}</h4>
                      <p className="meta">
                        Reason: {report.why} · Reported by {report.by}
                      </p>
                    </div>

                    <div className="row-actions">
                      <span
                        className={`status-pill ${
                          report.sev === "high" ? "st-rej" : "st-closed"
                        }`}
                      >
                        {report.sev} severity
                      </span>
                      <button
                        className="mini act"
                        onClick={() => adminAction(i, "reports", "removed")}
                      >
                        Remove listing
                      </button>
                      <button
                        className="mini"
                        onClick={() => adminAction(i, "reports", "dismissed")}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty glass" style={{ borderRadius: "var(--r)" }}>
                  <b>No open reports.</b>
                  <p className="meta">All community flags and policy violations resolved.</p>
                </div>
              )}
            </div>
          )}

          {/* LISTINGS OVERSIGHT */}
          {activeTab === "listings" && (
            <div>
              {projects.map((p) => {
                const client = clients[p.rid];
                return (
                  <div key={p.id} className="row-item glass">
                    <div className="grow">
                      <h4>{p.role}</h4>
                      <p className="meta">
                        {p.project} · {client?.org || "Client"} · {p.city} · {p.paid}
                      </p>
                    </div>

                    <div className="row-actions">
                      <StatusPill status="Live" />
                      <Link href={`/projects/${p.id}`} className="mini">
                        View brief
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
