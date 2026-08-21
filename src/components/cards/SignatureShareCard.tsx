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
    : `${baseOrigin}/explore`;

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

  const role = project || {
    id: 0,
    rid: "brightloop",
    role: "Frontend Developer — React",
    project: "Bloom Grocery App",
    format: "Web Development",
    city: "Remote",
    paid: "Paid" as const,
    comp: "₹80,000 fixed, paid in 2 milestones",
    deadline: "9 Aug",
    window: "Sep–Oct 2026",
    langs: ["React", "Remote"],
    age: "6–8 weeks",
    gender: "Any",
    mode: "Async, then video call",
    skills: ["API Integration"],
    desc: "",
  };

  const recruiter = clients[role.rid];
  const aggregate = aggregateRatings(role.rid);

  return (
    <div className="sig-card glass-strong" role="img" aria-label="Example project card">
      <span className="sig-tag">✓ Now hiring</span>
      <h3>{role.project}</h3>
      <p className="role-line">
        {role.role} · {role.city} · {role.age || "6–8 weeks"}
      </p>
      <div className="sig-meta">
        {recruiter && <Badge variant="verify">✓ {recruiter.verify}</Badge>}
        <Badge variant={role.paid === "Unpaid" ? "unpaid" : "paid"}>{role.paid}</Badge>
        <Badge variant="unpaid">{role.city}</Badge>
        {aggregate.n > 0 ? (
          <span className="score-inline">
            <span className="n">{aggregate.avg}</span>
            <em>· {aggregate.n} ratings</em>
          </span>
        ) : (
          <span className="score-inline">
            <span className="n">4.6</span>
            <em>· 23 ratings</em>
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
