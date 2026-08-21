"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/lib/store/marketplace-store";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import TrustRatingPanel from "@/components/ui/TrustRatingPanel";
import SignatureShareCard from "@/components/cards/SignatureShareCard";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = parseInt(resolvedParams.id, 10);
  const router = useRouter();

  const {
    projects,
    clients,
    session,
    hasApplied,
    submitApplication,
    showToast,
  } = useMarketplace();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [applyNote, setApplyNote] = useState("");
  const [applySampleUrl, setApplySampleUrl] = useState("");

  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    return (
      <main className="container animate-view-in" style={{ paddingBottom: "3rem" }}>
        <Link href="/explore" className="back-link">
          ← Back to projects
        </Link>
        <div className="empty glass" style={{ marginTop: "2rem", borderRadius: "var(--r)" }}>
          <h3>Project not found</h3>
          <p className="meta">This project listing may have closed or been removed.</p>
        </div>
      </main>
    );
  }

  const recruiter = clients[project.rid];
  const isApplied = hasApplied(project.id);

  const handleTryApply = () => {
    if (!session) {
      showToast("Sign in as a freelancer to apply.");
      router.push("/auth");
      return;
    }
    if (session.role !== "freelancer") {
      showToast("Only freelancer accounts can apply to projects.");
      return;
    }
    if (isApplied) {
      showToast("You have already applied to this project.");
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleConfirmApply = () => {
    submitApplication(project.id, applyNote, applySampleUrl);
    setIsApplyModalOpen(false);
    setApplyNote("");
    setApplySampleUrl("");
  };

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(label);
    } else {
      showToast(label);
    }
  };

  return (
    <main className="animate-view-in">
      <div className="container" style={{ paddingBottom: "3rem" }}>
        <Link href="/explore" className="back-link">
          ← Back to projects
        </Link>

        {/* HERO DETAIL */}
        <div className="detail-hero glass-strong">
          <div className="chip-row">
            {recruiter && <Badge variant="verify">✓ {recruiter.verify}</Badge>}
            <Badge variant={project.paid === "Unpaid" ? "unpaid" : "paid"}>
              {project.paid === "Unpaid" ? "Unpaid · disclosed" : project.paid}
            </Badge>
            <Badge variant="unpaid">{project.format}</Badge>
          </div>

          <h1 className="display">{project.role}</h1>
          <p className="lead">
            {project.project} · {recruiter?.org || "Client"} · {project.city}
          </p>

          <div
            style={{
              display: "flex",
              gap: "0.7rem",
              marginTop: "1.3rem",
              flexWrap: "wrap",
            }}
          >
            {isApplied ? (
              <Link href="/my-applications" className="btn btn-ghost">
                Applied · View status
              </Link>
            ) : (
              <button className="btn btn-primary" onClick={handleTryApply}>
                Apply
              </button>
            )}
            <button
              className="btn btn-ghost"
              onClick={() => setIsShareModalOpen(true)}
            >
              Share
            </button>
          </div>
        </div>

        {/* 2-COLUMN DETAIL GRID */}
        <div className="detail-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div className="panel glass">
              <h3>About the project</h3>
              <p>{project.desc}</p>
            </div>

            <div className="panel glass">
              <h3>Requirements</h3>
              <div className="kv">
                <span>Budget</span>
                <b>{project.age}</b>
              </div>
              <div className="kv">
                <span>Experience level</span>
                <b>{project.gender}</b>
              </div>
              <div className="kv">
                <span>Skills &amp; tools</span>
                <b>{project.langs.join(", ")}</b>
              </div>
              {project.skills.length > 0 && (
                <div className="kv">
                  <span>Additional skills</span>
                  <b>{project.skills.join(", ")}</b>
                </div>
              )}
            </div>
          </div>

          {/* STICKY SIDEBAR */}
          <div className="sticky-side">
            <div className="panel glass">
              <h3>Logistics</h3>
              <div className="kv">
                <span>Applications close</span>
                <b>{project.deadline}</b>
              </div>
              <div className="kv">
                <span>Timeline</span>
                <b>{project.window}</b>
              </div>
              <div className="kv">
                <span>Interview mode</span>
                <b>{project.mode}</b>
              </div>
              <div className="kv">
                <span>Compensation</span>
                <b>{project.comp}</b>
              </div>
            </div>

            <TrustRatingPanel rid={project.rid} />

            <div className="panel glass" style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              <h3>Safety &amp; Policies</h3>
              <p>
                Applying is completely free under the no-fee guarantee.{" "}
                <button
                  type="button"
                  style={{ color: "var(--warn)", fontWeight: 600, textDecoration: "underline" }}
                  onClick={() => showToast("Listing reported for moderation review.")}
                >
                  Report this listing
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* APPLY MODAL */}
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title="Apply to project"
        >
          <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "1rem" }}>
            Your verified profile and portfolio pieces will attach automatically.
          </p>

          <div className="field">
            <label>
              Note to client <span className="sub">— optional</span>
            </label>
            <textarea
              placeholder="E.g., I rebuilt a similar checkout flow for a D2C client last quarter."
              value={applyNote}
              onChange={(e) => setApplyNote(e.target.value)}
            />
          </div>

          <div className="field">
            <label>
              Relevant work sample <span className="sub">— optional link</span>
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/... or https://github.com/..."
              value={applySampleUrl}
              onChange={(e) => setApplySampleUrl(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
            onClick={handleConfirmApply}
          >
            Submit application
          </button>
          <p className="meta" style={{ textAlign: "center", marginTop: "0.8rem" }}>
            Status updates will appear in your Applications tab.
          </p>
        </Modal>

        {/* SHARE MODAL */}
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Share card"
        >
          <div style={{ marginBottom: "1.2rem" }}>
            <SignatureShareCard project={project} />
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => copyToClipboard(`https://brief.work/p/${project.project.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, "Listing URL copied.")}
            >
              Copy link
            </button>
            <button
              className="btn btn-ghost"
              style={{ flex: 1 }}
              onClick={() => showToast("Share card image generated.")}
            >
              Download card
            </button>
          </div>
        </Modal>
      </div>
    </main>
  );
}
