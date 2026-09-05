"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMarketplace } from "@/lib/store/marketplace-store";
import OnboardingGuideModal from "../ui/OnboardingGuideModal";
import { Sparkles, Menu, X } from "lucide-react";

export default function Navbar() {
  const { session, signOut } = useMarketplace();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile nav open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileNavOpen]);

  const getNavLinks = () => {
    if (!session) {
      return [{ href: "/explore", label: "Projects" }];
    }
    switch (session.role) {
      case "freelancer":
        return [
          { href: "/explore", label: "Projects" },
          { href: "/my-applications", label: "My applications" },
          { href: "/onboarding", label: "Profile" },
        ];
      case "client":
      case "indie":
        return [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/post-project", label: "Post a project" },
          { href: "/board", label: "Applications" },
        ];
      case "admin":
        return [
          { href: "/admin", label: "Moderation" },
          { href: "/explore", label: "Projects" },
        ];
      default:
        return [{ href: "/explore", label: "Projects" }];
    }
  };

  const navLinks = getNavLinks();

  const getRoleDisplayName = () => {
    if (!session) return "";
    const map: Record<string, string> = {
      freelancer: "Freelancer account",
      client: "Client account",
      indie: "Independent client account",
      admin: "Admin account",
    };
    return map[session.role] || "Account";
  };

  return (
    <>
      <div className="nav-wrap">
        <nav className="nav glass-strong" aria-label="Main Navigation">
          <Link href="/" className="brand">
            Brief <small>Beta</small>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links" aria-hidden={isMobileNavOpen}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <button
              type="button"
              className="mini"
              onClick={() => setIsGuideOpen(true)}
              title="Open Quick Start & Role Guide"
              style={{ background: "rgba(255,255,255,0.7)" }}
              aria-label="Open guide"
            >
              <Sparkles size={13} color="var(--accent)" />
              <span className="nav-guide-label">Guide</span>
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="nav-hamburger"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileNavOpen}
            >
              {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop account / sign-in */}
            <div className="nav-cta nav-cta-desktop" ref={menuRef}>
              {session ? (
                <div className="acct-wrap">
                  <button
                    className="acct"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    aria-haspopup="menu"
                    aria-expanded={isMenuOpen}
                    aria-label="Account menu"
                  >
                    <b>{session.name.split(" ")[0]}</b>
                    <span className="av" aria-hidden="true">
                      {session.name[0]}
                    </span>
                  </button>

                  {isMenuOpen && (
                    <div className="acct-menu" role="menu">
                      <div className="who">{session.name}</div>
                      <div className="role">{getRoleDisplayName()}</div>

                      <div style={{ borderTop: "1px solid var(--line)", marginTop: "0.4rem", paddingTop: "0.4rem" }}>
                        {session.role === "admin" && (
                          <button
                            role="menuitem"
                            onClick={() => {
                              setIsMenuOpen(false);
                              router.push("/admin");
                            }}
                          >
                            🛡️ Admin Portal
                          </button>
                        )}
                        {session.role === "freelancer" && (
                          <>
                            <button
                              role="menuitem"
                              onClick={() => {
                                setIsMenuOpen(false);
                                router.push("/onboarding");
                              }}
                            >
                              👤 Edit Profile
                            </button>
                            <button
                              role="menuitem"
                              onClick={() => {
                                setIsMenuOpen(false);
                                router.push("/my-applications");
                              }}
                            >
                              📋 My Applications
                            </button>
                            <button
                              role="menuitem"
                              onClick={() => {
                                setIsMenuOpen(false);
                                router.push("/explore");
                              }}
                            >
                              🔍 Explore Projects
                            </button>
                          </>
                        )}
                        {(session.role === "client" || session.role === "indie") && (
                          <>
                            <button
                              role="menuitem"
                              onClick={() => {
                                setIsMenuOpen(false);
                                router.push("/dashboard");
                              }}
                            >
                              📊 Dashboard
                            </button>
                            <button
                              role="menuitem"
                              onClick={() => {
                                setIsMenuOpen(false);
                                router.push("/post-project");
                              }}
                            >
                              ➕ Post a Project
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        role="menuitem"
                        className="out"
                        style={{ marginTop: "0.4rem", borderTop: "1px solid var(--line)" }}
                        onClick={() => { setIsMenuOpen(false); signOut(); router.push("/"); }}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth" className="btn btn-primary btn-sm">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile navigation drawer */}
      {isMobileNavOpen && (
        <div
          className="mobile-nav-veil"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={`mobile-nav ${isMobileNavOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="mobile-nav-inner">
          {/* Links */}
          <nav aria-label="Mobile navigation links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-nav-link ${pathname === link.href ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mobile-nav-divider" />

          {/* Account section */}
          {session ? (
            <div className="mobile-nav-account">
              <div className="mobile-nav-user">
                <span className="av" aria-hidden="true" style={{ width: 36, height: 36, fontSize: "0.8rem" }}>
                  {session.name[0]}
                </span>
                <div>
                  <b style={{ fontSize: "0.95rem" }}>{session.name}</b>
                  <p style={{ fontSize: "0.78rem", color: "var(--faint)", margin: 0 }}>{getRoleDisplayName()}</p>
                </div>
              </div>
              <button
                className="btn btn-quiet btn-sm"
                style={{ width: "100%", marginTop: "0.8rem", border: "1px solid var(--line)" }}
                onClick={() => { setIsMobileNavOpen(false); signOut(); router.push("/"); }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="btn btn-primary"
              style={{ width: "100%", textAlign: "center", justifyContent: "center" }}
              onClick={() => setIsMobileNavOpen(false)}
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            className="mini"
            onClick={() => { setIsMobileNavOpen(false); setIsGuideOpen(true); }}
            style={{ width: "100%", marginTop: "0.6rem", justifyContent: "center" }}
          >
            <Sparkles size={13} color="var(--accent)" />
            Quick Start Guide
          </button>
        </div>
      </div>

      <OnboardingGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
}
