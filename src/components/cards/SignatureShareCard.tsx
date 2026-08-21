"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Project } from "@/types";
import { useMarketplace } from "@/lib/store/marketplace-store";
import Badge from "../ui/Badge";

interface SignatureShareCardProps {
  project?: Project;
  freelancerName?: string;
  freelancerCity?: string;
  freelancerRate?: string;
  freelancerSkills?: string[];
  isFreelancer?: boolean;
}

export default function SignatureShareCard({
  project,
  freelancerName,
  freelancerCity,
  freelancerRate,
  freelancerSkills,
  isFreelancer = false,
}: SignatureShareCardProps) {
  const { clients, aggregateRatings } = useMarketplace();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const baseOrigin = origin || "https://brief.work";
  const shareUrl = isFreelancer
    ? `${baseOrigin}/onboarding`
    : project
    ? `${baseOrigin}/projects/${project.id}`
    : `${baseOrigin}/post-project`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, shareUrl, {
        width: 44,
        margin: 0,
        color: {
          dark: "#1E1B29",
          light: "#FFFFFF",
        },
      }).catch((err) => console.error(err));
    }
  }, [shareUrl]);

  if (isFreelancer) {
    return (
      <div className="sig-card glass-strong" role="img" aria-label="Freelancer share card">
        <span className="sig-tag">Freelancer on Brief</span>
        <h3>{freelancerName || "Verified Specialist"}</h3>
        <p className="role-line">
          {freelancerCity || "Mumbai"} · {freelancerRate || "₹1,000–2,500/hr"}
        </p>
        <div className="sig-meta">
          {(freelancerSkills || ["React", "Next.js", "UI Design"]).slice(0, 3).map((s) => (
            <Badge key={s} variant="unpaid">
              {s}
            </Badge>
          ))}
          <Badge variant="verify">✓ Brief profile</Badge>
        </div>
        <div className="sig-foot">
          <span className="sig-link">
            {shareUrl.replace(/^https?:\/\//, "")}
            <br />
            <b style={{ color: "var(--ink)" }}>View full profile</b>
          </span>
          <div className="qr-canvas-wrap">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    );
  }

  // If a real project is passed
  if (project) {
    const recruiter = clients[project.rid];
    const aggregate = aggregateRatings(project.rid);

    return (
      <div className="sig-card glass-strong" role="img" aria-label="Project card">
        <span className="sig-tag">✓ Now hiring</span>
        <h3>{project.project}</h3>
        <p className="role-line">
          {project.role} · {project.city} · {project.age || "Competitive"}
        </p>
        <div className="sig-meta">
          {recruiter && <Badge variant="verify">✓ {recruiter.verify}</Badge>}
          <Badge variant={project.paid === "Unpaid" ? "unpaid" : "paid"}>{project.paid}</Badge>
          <Badge variant="unpaid">{project.city}</Badge>
          {aggregate.n > 0 ? (
            <span className="score-inline">
              <span className="n">{aggregate.avg}</span>
              <em>· {aggregate.n} ratings</em>
            </span>
          ) : (
            <span className="score-inline">
              <em>New verified listing</em>
            </span>
          )}
        </div>
        <div className="sig-foot">
          <span className="sig-link">
            {shareUrl.replace(/^https?:\/\//, "")}
            <br />
            <b style={{ color: "var(--ink)" }}>Apply on Brief</b>
          </span>
          <div className="qr-canvas-wrap">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    );
  }

  // Empty showcase card if no project has been posted yet
  return (
    <div className="sig-card glass-strong" role="img" aria-label="Showcase share card">
      <span className="sig-tag">✓ Verified Brief</span>
      <h3>Post your first brief</h3>
      <p className="role-line">
        Dev · Design · Photography · Video · Content
      </p>
      <div className="sig-meta">
        <Badge variant="verify">✓ Organisation verified</Badge>
        <Badge variant="paid">Zero platform fee</Badge>
        <Badge variant="unpaid">Remote &amp; Local</Badge>
      </div>
      <div className="sig-foot">
        <span className="sig-link">
          {shareUrl.replace(/^https?:\/\//, "")}
          <br />
          <b style={{ color: "var(--ink)" }}>Post a project</b>
        </span>
        <div className="qr-canvas-wrap">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}
