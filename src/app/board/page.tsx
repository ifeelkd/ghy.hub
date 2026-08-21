"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMarketplace } from "@/lib/store/marketplace-store";

export default function BoardPage() {
  const { session, projects, applicantLanes, moveApplicant, showToast } = useMarketplace();

  const rid = session?.rid || "client";
  const myProjects = projects.filter((p) => p.rid === rid || !session?.rid);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(
    myProjects.length > 0 ? myProjects[0].id : 0
  );

  const activeProject = projects.find((p) => p.id === selectedProjectId) || myProjects[0] || projects[0];

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
            <span className="eyebrow">Applications Pipeline</span>
            <h1 className="display" style={{ fontSize: "clamp(1.9rem, 4vw, 2.7rem)" }}>
              {activeProject ? `${activeProject.project} — ${activeProject.role}` : "Applicant Board"}
            </h1>
            <p className="meta" style={{ marginTop: "0.3rem" }}>
              Closes {activeProject?.deadline || "Soon"} · Closing notifies all applicants automatically
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {myProjects.length > 1 && (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(parseInt(e.target.value, 10))}
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: "var(--r-sm)",
                  border: "1px solid var(--line)",
                  background: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                {myProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project}
                  </option>
                ))}
              </select>
            )}

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => showToast("Project closed. Applicants notified.")}
            >
              Close project
            </button>
          </div>
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
                    No candidates in {lane.title.toLowerCase()}
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
