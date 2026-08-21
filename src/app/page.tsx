"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMarketplace } from "@/lib/store/marketplace-store";
import ProjectCard from "@/components/cards/ProjectCard";
import SignatureShareCard from "@/components/cards/SignatureShareCard";
import OnboardingGuideModal from "@/components/ui/OnboardingGuideModal";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const { projects } = useMarketplace();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const featuredProjects = projects.slice(0, 3);

  return (
    <main className="animate-view-in">
      <div className="container">
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">
                Dev · Design · Photo · Video · Content
              </span>
              <h1 className="display">
                Freelance work,
                <br />
                <em>verified.</em>
              </h1>
              <p className="lead">
                Post projects. Apply with one profile. Review applicants in one
                place. Freelancers rate the clients they work with.
              </p>
              <div className="hero-ctas">
                <Link href="/explore" className="btn btn-primary">
                  View projects
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsGuideOpen(true)}
                  style={{ gap: "0.4rem" }}
                >
                  <Sparkles size={16} color="var(--accent)" />
                  Getting started guide
                </button>
              </div>
              <p className="hero-note">
                Free for freelancers. No bidding fees or subscriptions to apply.
              </p>
            </div>

            <div>
              <SignatureShareCard />
            </div>
          </div>
        </section>

        {/* ZERO FEE TRUST STRIP */}
        <section>
          <div className="trust-strip glass">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
              <ShieldCheck size={18} color="var(--ok)" />
              <strong>Policy — freelancers pay nothing.</strong>
            </div>
            <span style={{ color: "var(--muted)" }}>
              No bidding fees, subscriptions, or portfolio fees. Listings that
              charge freelancers are removed immediately.
            </span>
          </div>
        </section>

        {/* TWO SIDES, ONE SYSTEM */}
        <section className="section">
          <span className="eyebrow">What it does</span>
          <h2 className="display section-title">Two sides, one system</h2>
          <div className="journeys">
            <div className="journey glass">
              <h3>For freelancers</h3>
              <div className="step">
                <span className="step-n">1</span>
                <div>
                  <b>Build a profile</b>
                  <p>Portfolio pieces, skills, tools, and a case-study link.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-n">2</span>
                <div>
                  <b>Apply with 1-click</b>
                  <p>Your profile attaches automatically. Optional note and a work sample.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-n">3</span>
                <div>
                  <b>Rate the client</b>
                  <p>
                    After a project closes, record whether they responded, paid
                    as stated, and matched the brief.
                  </p>
                </div>
              </div>
            </div>

            <div className="journey glass">
              <h3>For clients</h3>
              <div className="step">
                <span className="step-n">1</span>
                <div>
                  <b>Post a project</b>
                  <p>Structured form. Compensation is a required field.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-n">2</span>
                <div>
                  <b>Share instantly</b>
                  <p>
                    Auto-generated card and link, sized for WhatsApp, LinkedIn,
                    and X.
                  </p>
                </div>
              </div>
              <div className="step">
                <span className="step-n">3</span>
                <div>
                  <b>Review candidates</b>
                  <p>
                    Applications land in four lanes: New, Shortlisted, Maybe,
                    Rejected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OPEN PROJECTS */}
        <section className="section" style={{ paddingTop: 0 }}>
          <span className="eyebrow">Live</span>
          <h2 className="display section-title">Open projects</h2>
          <div className="cards">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "1.6rem" }}>
            <Link href="/explore" className="btn btn-ghost">
              All projects
            </Link>
          </div>
        </section>

        {/* VERIFICATION TIERS */}
        <section className="section" style={{ paddingTop: 0 }}>
          <span className="eyebrow">Verification</span>
          <h2 className="display section-title">Verification levels</h2>
          <p className="lead" style={{ marginTop: "0.6rem" }}>
            Every listing shows its poster&apos;s verification level and their
            rating from freelancers. Posting privileges depend on verification.
          </p>
          <div className="tiers">
            <div className="tier glass">
              <div className="tier-dot">○</div>
              <b>Unverified</b>
              <p>
                Can browse and draft. Listings stay limited until identity is
                confirmed.
              </p>
            </div>
            <div className="tier glass">
              <div className="tier-dot" style={{ color: "var(--accent-deep)" }}>
                ✓
              </div>
              <b>Identity verified</b>
              <p>
                A real person confirmed. Can publish projects with the standard
                badge.
              </p>
            </div>
            <div className="tier glass">
              <div className="tier-dot" style={{ color: "var(--accent-deep)" }}>
                ✓✓
              </div>
              <b>Organisation verified</b>
              <p>
                Company, studio, or agency confirmed with working credentials.
              </p>
            </div>
            <div className="tier glass">
              <div className="tier-dot" style={{ color: "var(--accent-deep)" }}>
                ★
              </div>
              <b>Platform reviewed</b>
              <p>
                The listing itself checked by Brief before it goes live.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER CTA & FOOTER */}
        <footer>
          <div className="foot-cta glass-strong">
            <h2 className="display" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
              Create a profile or post a project.
            </h2>
            <p className="meta" style={{ margin: "0.4rem auto 1.3rem" }}>
              Free during beta.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.7rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link href="/auth" className="btn btn-primary">
                Sign in
              </Link>
              <Link href="/explore" className="btn btn-ghost">
                View projects
              </Link>
            </div>
          </div>
          <p>
            Brief · Built for India&apos;s web, design &amp; creative freelancers
            <br />
            Report a listing · Safety &amp; guidelines · Contact
          </p>
        </footer>
      </div>

      <OnboardingGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </main>
  );
}
