"use client";

import React from "react";
import Link from "next/link";
import { Project } from "@/types";
import { useMarketplace } from "@/lib/store/marketplace-store";
import Badge from "../ui/Badge";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { clients, aggregateRatings } = useMarketplace();
  const recruiter = clients[project.rid];
  const aggregate = aggregateRatings(project.rid);

  const renderPayBadge = () => {
    if (project.paid === "Unpaid") {
      return <Badge variant="unpaid">Unpaid · disclosed</Badge>;
    }
    return <Badge variant="paid">{project.paid}</Badge>;
  };

  return (
    <Link
      href={`/projects/${project.id}`}
      className="role-card glass"
      role="article"
    >
      <div className="top">
        <div>
          <h4>{project.role}</h4>
          <p className="proj">
            {project.project} · {project.format}
          </p>
        </div>
      </div>

      <div className="chip-row">
        {recruiter && <Badge variant="verify">✓ {recruiter.verify}</Badge>}
        {renderPayBadge()}
      </div>

      <div className="chip-row">
        {project.langs.map((lang) => (
          <Badge key={lang} variant="unpaid">
            {lang}
          </Badge>
        ))}
        {project.age && project.age !== "—" && (
          <Badge variant="unpaid">{project.age}</Badge>
        )}
      </div>

      <div className="foot">
        <span className="meta">{project.city}</span>
        {aggregate.n > 0 ? (
          <span className="score-inline">
            <span className="n">{aggregate.avg}</span>
            <em>· {aggregate.n} rating{aggregate.n === 1 ? "" : "s"}</em>
          </span>
        ) : (
          <span className="score-inline">
            <em>No ratings yet</em>
          </span>
        )}
      </div>
    </Link>
  );
}
