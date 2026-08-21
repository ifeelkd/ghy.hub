"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/lib/store/marketplace-store";
import Modal from "./Modal";
import Badge from "./Badge";
import { ShieldCheck, UserCheck, Building2, User, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

interface OnboardingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingGuideModal({
  isOpen,
  onClose,
}: OnboardingGuideModalProps) {
  const { session, loginAsDemo } = useMarketplace();
  const router = useRouter();

  const handleSelectRole = (role: "freelancer" | "client" | "indie" | "admin", destination: string) => {
    loginAsDemo(role);
    onClose();
    router.push(destination);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Welcome to Brief — Quick Start"
      maxWidth="600px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <p style={{ fontSize: "0.92rem", color: "var(--muted)", lineHeight: 1.5 }}>
          Brief is a verified freelance marketplace built with a zero-fee pledge and transparent freelancer-driven client ratings. Choose how you want to explore the platform:
        </p>

        {/* ROLE SELECTION TILES */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
          {/* 1. FREELANCER */}
          <div
            className="glass"
            style={{
              padding: "1rem 1.1rem",
              borderRadius: "var(--r-sm)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              border: session?.role === "freelancer" ? "2px solid var(--accent)" : "1px solid var(--line)",
            }}
            onClick={() => handleSelectRole("freelancer", "/explore")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "var(--accent-tint)",
                    color: "var(--accent-deep)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User size={20} />
                </div>
                <div>
                  <b style={{ fontSize: "0.95rem" }}>I am a Freelancer</b>
                  <p className="meta">Browse listings, apply with 1-click profile, rate closed projects</p>
                </div>
              </div>
              <ArrowRight size={18} color="var(--accent)" />
            </div>
          </div>

          {/* 2. CLIENT / BUSINESS */}
          <div
            className="glass"
            style={{
              padding: "1rem 1.1rem",
              borderRadius: "var(--r-sm)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              border: session?.role === "client" ? "2px solid var(--accent)" : "1px solid var(--line)",
            }}
            onClick={() => handleSelectRole("client", "/dashboard")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "var(--ok-tint)",
                    color: "var(--ok)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building2 size={20} />
                </div>
                <div>
                  <b style={{ fontSize: "0.95rem" }}>I am a Business / Studio Client</b>
                  <p className="meta">Post briefs, manage applicant Kanban board, share social cards</p>
                </div>
              </div>
              <ArrowRight size={18} color="var(--ok)" />
            </div>
          </div>

          {/* 3. INDIE CLIENT */}
          <div
            className="glass"
            style={{
              padding: "1rem 1.1rem",
              borderRadius: "var(--r-sm)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              border: session?.role === "indie" ? "2px solid var(--accent)" : "1px solid var(--line)",
            }}
            onClick={() => handleSelectRole("indie", "/post-project")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(30,27,41,0.07)",
                    color: "var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserCheck size={20} />
                </div>
                <div>
                  <b style={{ fontSize: "0.95rem" }}>I am an Independent Client</b>
                  <p className="meta">Post individual or NGO projects without agency overhead</p>
                </div>
              </div>
              <ArrowRight size={18} color="var(--muted)" />
            </div>
          </div>

          {/* 4. ADMIN MODERATOR */}
          <div
            className="glass"
            style={{
              padding: "1rem 1.1rem",
              borderRadius: "var(--r-sm)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              border: session?.role === "admin" ? "2px solid var(--accent)" : "1px solid var(--line)",
            }}
            onClick={() => handleSelectRole("admin", "/admin")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "var(--warn-tint)",
                    color: "var(--warn)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <b style={{ fontSize: "0.95rem" }}>Admin Moderation Desk</b>
                  <p className="meta">Verify credentials, review community reports, remove policy violators</p>
                </div>
              </div>
              <ArrowRight size={18} color="var(--warn)" />
            </div>
          </div>
        </div>

        {/* CORE PLATFORM PILLARS */}
        <div
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-sm)",
            padding: "0.9rem 1rem",
            fontSize: "0.82rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={15} color="var(--ok)" />
            <span><b>Zero Fees for Freelancers:</b> No bidding credits or subscription gates.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={15} color="var(--ok)" />
            <span><b>Lightweight WebP Media:</b> Images are compressed client-side (~95% savings).</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={15} color="var(--ok)" />
            <span><b>Immutable Trust Ratings:</b> Clients are rated by freelancers they actually worked with.</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
