"use client";

import React, { useState, useEffect } from "react";
import { useMarketplace } from "@/lib/store/marketplace-store";
import ProjectCard from "@/components/cards/ProjectCard";
import { Search, Briefcase } from "lucide-react";

export default function ExplorePage() {
  const { projects, aggregateRatings, clients } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [paidOnly, setPaidOnly] = useState(false);
  const [ratedOnly, setRatedOnly] = useState(false);

  useEffect(() => { document.title = "Browse Projects — Brief"; }, []);

  const cityOptions = ["Remote", "Mumbai", "Delhi NCR", "Hyderabad", "Bengaluru", "Pune"];
  const categoryOptions = [
    "Teaching & Tutoring",
    "Academic Mentorship",
    "Web Development",
    "UI/UX Design",
    "Content Writing",
    "Video Editing",
  ];

  const filteredProjects = projects.filter((r) => {
    if (selectedCity && r.city !== selectedCity) return false;
    if (selectedCategory && r.format !== selectedCategory) return false;
    if (paidOnly && r.paid === "Unpaid") return false;
    if (ratedOnly) {
      const a = aggregateRatings(r.rid);
      if (!a.n || parseFloat(a.avg) < 4.0) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const recruiter = clients[r.rid];
      const matchString = `${r.role} ${r.project} ${r.city} ${r.format} ${r.langs.join(" ")} ${r.skills.join(" ")} ${
        recruiter?.org || ""
      }`.toLowerCase();
      if (!matchString.includes(q)) return false;
    }
    return true;
  });

  return (
    <main className="animate-view-in">
      <div className="container">
        <div className="explore-head">
          <span className="eyebrow">Explore</span>
          <h1 className="display" style={{ fontSize: "clamp(1.9rem, 4vw, 2.7rem)" }}>
            Open projects &amp; gigs
          </h1>

          {/* SEARCH BAR */}
          <div className="search-bar glass">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search projects, subjects (Math, Physics, CBSE), clients, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search projects"
            />
          </div>

          {/* CATEGORY & FILTER CHIPS */}
          <div className="filters" style={{ flexWrap: "wrap", gap: "0.4rem" }}>
            <button
              type="button"
              className={`chip ${!selectedCategory ? "sel" : ""}`}
              onClick={() => setSelectedCategory(null)}
            >
              All formats
            </button>
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`chip ${selectedCategory === cat ? "sel" : ""}`}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="filters" style={{ marginTop: "0.5rem" }}>
            {cityOptions.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip ${selectedCity === c ? "sel" : ""}`}
                onClick={() => setSelectedCity(selectedCity === c ? null : c)}
              >
                {c}
              </button>
            ))}
            <button
              type="button"
              className={`chip ${paidOnly ? "sel" : ""}`}
              onClick={() => setPaidOnly(!paidOnly)}
            >
              Paid only
            </button>
            <button
              type="button"
              className={`chip ${ratedOnly ? "sel" : ""}`}
              onClick={() => setRatedOnly(!ratedOnly)}
            >
              Rated 4.0+
            </button>
          </div>

          <p className="meta results-meta">
            {filteredProjects.length} open project
            {filteredProjects.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* RESULTS GRID */}
        <div className="cards" style={{ marginTop: "0.9rem", paddingBottom: "3rem" }}>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div
              style={{
                gridColumn: "1/-1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.8rem",
                padding: "3.5rem 1rem",
                textAlign: "center",
                borderRadius: "var(--r)",
                background: "rgba(255,255,255,0.5)",
                border: "1px dashed var(--line)",
              }}
            >
              <Briefcase size={36} style={{ opacity: 0.25 }} />
              <b style={{ fontSize: "1.05rem" }}>No projects match your criteria</b>
              <p style={{ color: "var(--muted)", fontSize: "0.88rem", maxWidth: "280px" }}>
                Try clearing a filter, broadening your search, or check back later — new projects are posted daily.
              </p>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity(null);
                  setSelectedCategory(null);
                  setPaidOnly(false);
                  setRatedOnly(false);
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
