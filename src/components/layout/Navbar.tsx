"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMarketplace } from "@/lib/store/marketplace-store";
import OnboardingGuideModal from "../ui/OnboardingGuideModal";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  const { session, signOut, loginAsDemo } = useMarketplace();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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

          <div className="nav-links">
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
            >
              <Sparkles size={13} color="var(--accent)" />
              <span>Guide</span>
            </button>

            <div className="nav-cta" ref={menuRef}>
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

                      <div style={{ padding: "0.4rem 0.75rem", fontSize: "0.72rem", color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                        Switch Role / Demo
                      </div>
                      <button
                        role="menuitem"
                        onClick={() => {
                          loginAsDemo("freelancer");
                          setIsMenuOpen(false);
                          router.push("/explore");
                        }}
                      >
                        👤 Freelancer (Keerti)
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => {
                          loginAsDemo("client");
                          setIsMenuOpen(false);
                          router.push("/dashboard");
                        }}
                      >
                        🏢 Client (Aditya)
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => {
                          loginAsDemo("indie");
                          setIsMenuOpen(false);
                          router.push("/dashboard");
                        }}
                      >
                        🌱 Indie Client (Rhea)
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => {
                          loginAsDemo("admin");
                          setIsMenuOpen(false);
                          router.push("/admin");
                        }}
                      >
                        🛡️ Admin Desk
                      </button>

                      <button
                        role="menuitem"
                        className="out"
                        style={{ marginTop: "0.3rem", borderTop: "1px solid var(--line)" }}
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut();
                          router.push("/");
                        }}
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

      <OnboardingGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
}
