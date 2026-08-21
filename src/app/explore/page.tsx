"use client";

import React, { useState } from "react";
import { useMarketplace } from "@/lib/store/marketplace-store";
import ProjectCard from "@/components/cards/ProjectCard";
import { Search } from "lucide-react";

export default function ExplorePage() {
  const { projects, aggregateRatings, clients } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [paidOnly, setPaidOnly] = useState(false);
  const [ratedOnly, setRatedOnly] = useState(false);

  const cityOptions = ["Remote", "Mumbai", "Delhi NCR", "Hyderabad", "Bengaluru", "Pune"];

  const filteredProjects = projects.filter((r) => {
    if (selectedCity && r.city !== selectedCity) return false;
    if (paidOnly && r.paid === "Unpaid") return false;
    if (ratedOnly) {
      const a = aggregateRatings(r.rid);
      if (!a.n || parseFloat(a.avg) < 4.0) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const recruiter = clients[r.rid];
      const matchString = `${r.role} ${r.project} ${r.city} ${r.format} ${r.langs.join(" ")} ${
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
            Open projects
          </h1>

          {/* SEARCH BAR */}
          <div className="search-bar glass">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search projects, clients, cities, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search projects"
            />
          </div>

          {/* FILTER CHIPS */}
          <div className="filters">
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
              className="empty glass"
              style={{ borderRadius: "var(--r)", gridColumn: "1/-1" }}
            >
              <b>No projects match your criteria.</b>
              <br />
              Try clearing a filter or searching for another keyword.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
