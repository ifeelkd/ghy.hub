"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMarketplace } from "@/lib/store/marketplace-store";
import StatusPill from "@/components/ui/StatusPill";
import Modal from "@/components/ui/Modal";

export default function MyApplicationsPage() {
  const { myApps, projects, clients, submitRating, showToast } = useMarketplace();

  const [ratingModalRoleId, setRatingModalRoleId] = useState<number | null>(null);
  const [responded, setResponded] = useState<boolean | "na" | null>(null);
  const [described, setDescribed] = useState<boolean | "na" | null>(null);
  const [paid, setPaid] = useState<boolean | "na" | null>(null);
  const [overall, setOverall] = useState<number | null>(null);
  const [ratingNote, setRatingNote] = useState("");

  const shortlistedCount = myApps.filter((a) => a.status === "Shortlisted").length;
  const closedCount = myApps.filter((a) => a.status === "Closed").length;
  const pendingRatingCount = myApps.filter((a) => a.status === "Closed" && !a.rated).length;

  const activeRatingProject = ratingModalRoleId !== null ? projects.find((p) => p.id === ratingModalRoleId) : null;
  const activeRecruiter = activeRatingProject ? clients[activeRatingProject.rid] : null;

  const handleOpenRate = (roleId: number) => {
    setRatingModalRoleId(roleId);
    setResponded(null);
    setDescribed(null);
    setPaid(null);
    setOverall(null);
    setRatingNote("");
  };

  const handleRatingSubmit = () => {
    if (overall === null) {
      showToast("Select an overall score.");
      return;
    }
    if (responded === null) {
      showToast("Answer whether they responded.");
      return;
    }
    if (ratingModalRoleId === null) return;

    submitRating(ratingModalRoleId, {
      overall,
      responded: responded ?? "na",
      described: described ?? "na",
      paid: paid ?? "na",
      note: ratingNote.trim(),
    });
    setRatingModalRoleId(null);
  };

  return (
    <main className="animate-view-in">
      <div className="container" style={{ paddingBottom: "3rem" }}>
        <div style={{ paddingTop: "1.2rem" }}>
          <span className="eyebrow">Applications</span>
          <h1 className="display" style={{ fontSize: "clamp(1.9rem, 4vw, 2.7rem)" }}>
            My applications
          </h1>
          <p className="meta" style={{ marginTop: "0.3rem" }}>
            Closed projects can be rated. Ratings are public, transparent, and attributed to your verified profile.
          </p>
        </div>

        {/* STATS */}
        <div className="stat-grid">
          <div className="stat glass">
            <b>{myApps.length}</b>
            <span>Total applications</span>
          </div>
          <div className="stat glass">
            <b>{shortlistedCount}</b>
            <span>Shortlisted</span>
          </div>
          <div className="stat glass">
            <b>{closedCount}</b>
            <span>Closed</span>
          </div>
          <div className="stat glass">
            <b>{pendingRatingCount}</b>
            <span>Awaiting your rating</span>
          </div>
        </div>

        {/* LIST */}
        <div style={{ marginTop: "1.4rem" }}>
          {myApps.length > 0 ? (
            myApps.map((app) => {
              const project = projects.find((p) => p.id === app.roleId);
              if (!project) return null;
              const recruiter = clients[project.rid];

              return (
                <div key={app.roleId} className="row-item glass">
                  <div className="grow">
                    <h4>{project.role}</h4>
                    <p className="meta">
                      {project.project} · {recruiter?.org || "Client"} · Applied {app.applied}
                    </p>
                  </div>

                  <div className="row-actions">
                    <StatusPill status={app.status} />

                    {app.status === "Closed" && !app.rated && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenRate(app.roleId)}
                      >
                        Rate client
                      </button>
                    )}

                    {app.rated && (
                      <StatusPill status="Rated" />
                    )}

                    <Link href={`/projects/${project.id}`} className="mini">
                      View project
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty glass" style={{ borderRadius: "var(--r)" }}>
              <b>No applications yet.</b>
              <br />
              Browse open listings on the Projects explore page.
            </div>
          )}
        </div>

        {/* RATE MODAL */}
        <Modal
          isOpen={ratingModalRoleId !== null}
          onClose={() => setRatingModalRoleId(null)}
          title="Rate this client"
        >
          {activeRecruiter && activeRatingProject && (
            <p style={{ fontSize: "0.88rem", color: "var(--muted)", marginBottom: "1.2rem" }}>
              {activeRecruiter.org} — {activeRatingProject.project}. Your review is public and permanently recorded on their listings.
            </p>
          )}

          <div className="field">
            <label>Did they respond to your application?</label>
            <div className="yn">
              <button
                type="button"
                className={responded === true ? "sel" : ""}
                onClick={() => setResponded(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={responded === false ? "sel" : ""}
                onClick={() => setResponded(false)}
              >
                No
              </button>
            </div>
          </div>

          <div className="field">
            <label>Was the project as described?</label>
            <div className="yn">
              <button
                type="button"
                className={described === true ? "sel" : ""}
                onClick={() => setDescribed(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={described === false ? "sel" : ""}
                onClick={() => setDescribed(false)}
              >
                No
              </button>
              <button
                type="button"
                className={described === "na" ? "sel" : ""}
                onClick={() => setDescribed("na")}
              >
                Didn&apos;t start
              </button>
            </div>
          </div>

          <div className="field">
            <label>Were you paid as stated?</label>
            <div className="yn">
              <button
                type="button"
                className={paid === true ? "sel" : ""}
                onClick={() => setPaid(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={paid === false ? "sel" : ""}
                onClick={() => setPaid(false)}
              >
                No
              </button>
              <button
                type="button"
                className={paid === "na" ? "sel" : ""}
                onClick={() => setPaid("na")}
              >
                Not applicable
              </button>
            </div>
          </div>

          <div className="field">
            <label>
              Overall <span className="sub">— 1 lowest, 5 highest</span>
            </label>
            <div className="scale">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={overall === num ? "sel" : ""}
                  onClick={() => setOverall(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>
              Note <span className="sub">— optional, public</span>
            </label>
            <textarea
              placeholder="Factual detail helps other freelancers evaluate this client."
              value={ratingNote}
              onChange={(e) => setRatingNote(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={handleRatingSubmit}
          >
            Submit rating
          </button>
          <p className="meta" style={{ textAlign: "center", marginTop: "0.8rem" }}>
            Ratings cannot be edited after submission.
          </p>
        </Modal>
      </div>
    </main>
  );
}
