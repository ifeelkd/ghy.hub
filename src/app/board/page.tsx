"use client";

import React from "react";
import { useMarketplace } from "@/lib/store/marketplace-store";

export default function BoardPage() {
  const { applicantLanes, moveApplicant, showToast } = useMarketplace();

  const lanes = [
    { key: "new", title: "New" },
    { key: "short", title: "Shortlisted" },
    { key: "maybe", title: "Maybe" },
    { key: "rej", title: "Rejected" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2);
  };

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
            <span className="eyebrow">Applications</span>
            <h1 className="display" style={{ fontSize: "clamp(1.9rem, 4vw, 2.7rem)" }}>
              Bloom Grocery App — Frontend Developer
            </h1>
            <p className="meta" style={{ marginTop: "0.3rem" }}>
              Closes 9 Aug · Closing notifies all applicants automatically
            </p>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => showToast("Project closed. Applicants notified.")}
          >
            Close project
          </button>
        </div>

        {/* KANBAN BOARD */}
        <div className="board">
          {lanes.map((lane) => {
            const list = applicantLanes[lane.key] || [];
            return (
              <div key={lane.key} className="lane glass">
                <div className="lane-head">
                  <b>{lane.title}</b>
                  <span className="lane-count">{list.length}</span>
                </div>

                {list.length > 0 ? (
                  list.map((candidate, i) => (
                    <div key={i} className="app-card">
                      <div className="app-top">
                        <div className="avatar">{getInitials(candidate.n)}</div>
                        <div>
                          <b>{candidate.n}</b>
                          <span className="meta">{candidate.c}</span>
                        </div>
                      </div>

                      <p className="app-note">{candidate.note}</p>

                      <div className="app-actions">
                        {lane.key !== "short" && (
                          <button
                            className="mini act"
                            onClick={() => moveApplicant(lane.key, i, "short")}
                          >
                            Shortlist
                          </button>
                        )}
                        {lane.key !== "maybe" && (
                          <button
                            className="mini"
                            onClick={() => moveApplicant(lane.key, i, "maybe")}
                          >
                            Maybe
                          </button>
                        )}
                        {lane.key !== "rej" && (
                          <button
                            className="mini"
                            onClick={() => moveApplicant(lane.key, i, "rej")}
                          >
                            Pass
                          </button>
                        )}
                        {lane.key !== "new" && (
                          <button
                            className="mini"
                            onClick={() => moveApplicant(lane.key, i, "new")}
                            title="Reset to New"
                          >
                            ↺
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="meta" style={{ textAlign: "center", padding: "1.5rem 0" }}>
                    Empty lane
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
