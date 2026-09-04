import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found — Brief",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(5rem, 20vw, 8rem)",
            lineHeight: 1,
            color: "var(--accent)",
            opacity: 0.18,
            userSelect: "none",
            marginBottom: "-1rem",
          }}
        >
          404
        </div>
        <h1
          className="display"
          style={{ fontSize: "clamp(1.8rem, 5vw, 2.4rem)", marginBottom: "0.6rem" }}
        >
          Page not found
        </h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.95rem",
            marginBottom: "2rem",
            lineHeight: 1.6,
          }}
        >
          This page doesn&apos;t exist or may have been moved. Head back to explore open
          projects and opportunities.
        </p>
        <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/explore" className="btn btn-primary">
            Browse Projects
          </Link>
          <Link href="/" className="btn btn-ghost">
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
