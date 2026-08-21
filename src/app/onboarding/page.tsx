"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useMarketplace, CITIES, LANGS, SKILLS } from "@/lib/store/marketplace-store";
import TokenInput from "@/components/ui/TokenInput";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import SignatureShareCard from "@/components/cards/SignatureShareCard";
import { uploadOptimizedImage } from "@/lib/supabase/storage";
import { formatFileSize } from "@/lib/image-optimizer";
import { UploadCloud, CheckCircle2, Trash2 } from "lucide-react";

interface PortfolioPiece {
  id: string;
  url: string;
  originalSize: number;
  optimizedSize: number;
  reductionPercentage: number;
}

export default function OnboardingPage() {
  const { session, updateFreelancerProfile, showToast } = useMarketplace();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(session?.name || "");
  const [city, setCity] = useState<string[]>([]);
  const [sinceDate, setSinceDate] = useState("");
  const [rateRange, setRateRange] = useState("₹1,000–2,500/hr");
  const [tagline, setTagline] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  
  // Real optimized portfolio pieces (clean state)
  const [portfolioPieces, setPortfolioPieces] = useState<PortfolioPiece[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tools, setTools] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [availableFrom, setAvailableFrom] = useState("");
  const [experience, setExperience] = useState("New freelancer");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Completion calculation
  const flags = [
    !!name.trim(),
    !!tagline.trim(),
    portfolioPieces.length >= 2,
    !!portfolioUrl.trim(),
    tools.length > 0,
    specializations.length > 0,
  ];
  const completedCount = flags.filter(Boolean).length;
  const completionPercentage = Math.round(10 + (completedCount / 6) * 90);

  const validateStep = (s: number) => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!name.trim()) newErrors.name = "Enter your display name.";
      if (!city.length) newErrors.city = "Select your base city.";
      if (sinceDate && new Date(sinceDate) > new Date()) {
        newErrors.sinceDate = "This date cannot be in the future.";
      }
    }
    if (s === 2) {
      if (portfolioPieces.length < 2) {
        newErrors.thumbs = "Add at least two portfolio pieces (minimum 2 required).";
      }
    }
    if (s === 3) {
      if (!tools.length) newErrors.tools = "Select at least one skill or tool.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
      showToast("Please check the highlighted fields.");
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      await updateFreelancerProfile({
        name,
        city: city[0] || "Mumbai",
        rate_range: rateRange,
        tagline,
        portfolio_url: portfolioUrl,
        portfolio_items: portfolioPieces.map((p) => p.url),
        tools,
        skills: specializations,
        experience_level: experience,
      });
      setStep(5);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (portfolioPieces.length + files.length > 4) {
      showToast("Maximum 4 portfolio pieces allowed.");
      return;
    }

    setIsUploading(true);
    try {
      const newPieces: PortfolioPiece[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadOptimizedImage(file, "portfolio");
        newPieces.push({
          id: Math.random().toString(36).substring(2, 9),
          url: res.url,
          originalSize: res.optimizedResult.originalSize,
          optimizedSize: res.optimizedResult.optimizedSize,
          reductionPercentage: res.optimizedResult.reductionPercentage,
        });
      }
      setPortfolioPieces([...portfolioPieces, ...newPieces]);
      showToast(`Uploaded & compressed ${newPieces.length} image(s) to WebP format.`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to compress or upload image.";
      showToast(errorMsg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePiece = (id: string) => {
    setPortfolioPieces(portfolioPieces.filter((p) => p.id !== id));
  };

  return (
    <main className="animate-view-in">
      <div className="container" style={{ paddingBottom: "3rem" }}>
        <div style={{ paddingTop: "1.2rem" }}>
          <span className="eyebrow">Freelancer profile</span>
          <h1 className="display" style={{ fontSize: "clamp(1.9rem, 4vw, 2.7rem)" }}>
            Build your freelancer profile
          </h1>
          <p className="lead" style={{ marginTop: "0.4rem" }}>
            Four steps. Images are automatically optimized and compressed client-side to save bandwidth.
          </p>
        </div>

        <div className="flow-wrap">
          {/* FLOW FORM */}
          <div className="flow-main glass">
            {step <= 4 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="meta">Step {step} of 4</span>
                  <span className="meta">Saved automatically</span>
                </div>
                <div className="progress">
                  <i style={{ width: `${(step / 4) * 100}%` }}></i>
                </div>
              </>
            )}

            {/* STEP 1: BASICS */}
            {step === 1 && (
              <div className="fstep">
                <h2 className="display">The basics</h2>
                <p className="hint">Phone number stays private until you choose to share it.</p>

                <div className={`field ${errors.name ? "bad" : ""}`}>
                  <label>
                    Display name <span className="sub">— as shown to clients</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <div className="err">{errors.name}</div>}
                </div>

                <div className={`field ${errors.city ? "bad" : ""}`}>
                  <label>
                    Base city <span className="sub">— select or type your own</span>
                  </label>
                  <TokenInput
                    options={CITIES}
                    selected={city}
                    onChange={(vals) => setCity(vals.slice(-1))}
                    placeholder="Select or type your city"
                    maxItems={1}
                  />
                  {errors.city && <div className="err">{errors.city}</div>}
                </div>

                <div className="field-row">
                  <div className={`field ${errors.sinceDate ? "bad" : ""}`}>
                    <label>
                      Freelancing since <span className="sub">— private</span>
                    </label>
                    <input
                      type="date"
                      value={sinceDate}
                      onChange={(e) => setSinceDate(e.target.value)}
                    />
                    {errors.sinceDate && <div className="err">{errors.sinceDate}</div>}
                  </div>

                  <div className="field">
                    <label>Rate range</label>
                    <select
                      value={rateRange}
                      onChange={(e) => setRateRange(e.target.value)}
                    >
                      <option>₹500–1,000/hr</option>
                      <option>₹1,000–2,500/hr</option>
                      <option>₹2,500–5,000/hr</option>
                      <option>₹5,000+/hr</option>
                      <option>Project-based only</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label>
                    One-line tagline <span className="sub">— optional</span>
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="E.g. Full-stack developer specialising in React and Next.js"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: PORTFOLIO & OPTIMIZED UPLOADS */}
            {step === 2 && (
              <div className="fstep">
                <h2 className="display">Portfolio &amp; work samples</h2>
                <p className="hint">
                  Minimum two pieces. Files are compressed to WebP automatically to save storage and ensure instant loading.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />

                <div
                  className="upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  style={{ borderColor: errors.thumbs ? "var(--warn)" : "" }}
                >
                  <UploadCloud size={28} style={{ margin: "0 auto 0.5rem", color: "var(--accent)" }} />
                  <b>{isUploading ? "Compressing & Uploading..." : "Upload & Compress Portfolio Pieces"}</b>
                  <span>Click to browse JPG, PNG, WebP (Auto-compressed to ~60KB) · {portfolioPieces.length}/4 added</span>
                </div>
                {errors.thumbs && <div className="err">{errors.thumbs}</div>}

                {/* THUMBNAILS GRID WITH COMPRESSION BADGES */}
                <div className="thumbs" style={{ marginTop: "1rem" }}>
                  {portfolioPieces.map((piece) => (
                    <div
                      key={piece.id}
                      className="thumb"
                      style={{
                        backgroundImage: `url(${piece.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <button
                        type="button"
                        className="x"
                        onClick={() => removePiece(piece.id)}
                        aria-label="Remove piece"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div
                        style={{
                          position: "absolute",
                          bottom: 4,
                          left: 4,
                          right: 4,
                          background: "rgba(30,27,41,.75)",
                          color: "#fff",
                          fontSize: "0.62rem",
                          padding: "2px 4px",
                          borderRadius: "4px",
                          textAlign: "center",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {formatFileSize(piece.optimizedSize)} ({piece.reductionPercentage}% saved)
                      </div>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - portfolioPieces.length) }).map((_, j) => (
                    <div key={j} className="thumb empty-t" />
                  ))}
                </div>

                <div className="field" style={{ marginTop: "1.4rem" }}>
                  <label>
                    Portfolio link <span className="sub">— Behance, GitHub, Dribbble, or Drive</span>
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>
            )}

            {/* STEP 3: SKILLS & TOOLS */}
            {step === 3 && (
              <div className="fstep">
                <h2 className="display">Skills &amp; tools</h2>
                <p className="hint">
                  Clients filter by these. Select from the list or type to add your own.
                </p>

                <div className={`field ${errors.tools ? "bad" : ""}`}>
                  <label>Skills &amp; tools you use</label>
                  <TokenInput
                    options={LANGS}
                    selected={tools}
                    onChange={setTools}
                    placeholder="Select or type tools (e.g. React, Figma, Next.js)"
                  />
                  {errors.tools && <div className="err">{errors.tools}</div>}
                </div>

                <div className="field">
                  <label>
                    Specializations <span className="sub">— optional</span>
                  </label>
                  <TokenInput
                    options={SKILLS}
                    selected={specializations}
                    onChange={setSpecializations}
                    placeholder="Select or type specializations (e.g. SEO, API Integration)"
                  />
                </div>

                <div className="field">
                  <label>
                    Available from <span className="sub">— optional</span>
                  </label>
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Experience</label>
                  <SegmentedControl
                    options={["New freelancer", "1–10 projects", "Established"]}
                    value={experience}
                    onChange={setExperience}
                  />
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & PUBLISH */}
            {step === 4 && (
              <div className="fstep">
                <h2 className="display">Review &amp; publish</h2>
                <p className="hint">
                  Publishing makes your profile public. You can update or unpublish anytime.
                </p>

                <div className="panel" style={{ background: "rgba(255,255,255,.6)", border: "1px solid var(--line)" }}>
                  <div className="kv">
                    <span>Profile</span>
                    <b>{name || "—"}</b>
                  </div>
                  <div className="kv">
                    <span>City · Rate range</span>
                    <b>
                      {city[0] || "—"} · {rateRange}
                    </b>
                  </div>
                  <div className="kv">
                    <span>Portfolio pieces</span>
                    <b>{portfolioPieces.length} pieces (WebP optimized)</b>
                  </div>
                  <div className="kv">
                    <span>Skills &amp; tools</span>
                    <b>{tools.join(", ") || "—"}</b>
                  </div>
                  <div className="kv">
                    <span>Specializations</span>
                    <b>{specializations.join(", ") || "—"}</b>
                  </div>
                  <div className="kv">
                    <span>Portfolio</span>
                    <b>{portfolioUrl ? "Link added" : "Not added"}</b>
                  </div>
                  <div className="kv">
                    <span>Visibility</span>
                    <b>Public · Searchable · Verified</b>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: SUCCESS STATE */}
            {step === 5 && (
              <div className="fstep success-wrap">
                <div className="success-ico">
                  <CheckCircle2 size={36} color="var(--ok)" />
                </div>
                <h2 className="display">Profile live</h2>
                <p className="lead" style={{ margin: "0 auto 1.4rem" }}>
                  Your profile is live and verified. You can now apply directly to all open projects.
                </p>
                <div style={{ display: "flex", gap: "0.7rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/explore" className="btn btn-primary">
                    View open projects
                  </Link>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setIsShareModalOpen(true)}
                  >
                    Share card
                  </button>
                </div>
              </div>
            )}

            {/* NAVIGATION FOOTER */}
            {step <= 4 && (
              <div className="flow-nav">
                <button
                  className="btn btn-quiet"
                  onClick={handleBack}
                  disabled={step === 1}
                >
                  Back
                </button>
                <button className="btn btn-primary" onClick={handleNext}>
                  {step === 4 ? "Publish profile" : "Continue"}
                </button>
              </div>
            )}
          </div>

          {/* STICKY LIVE PREVIEW CARD */}
          <aside className="preview-card glass-strong" aria-label="Live profile preview">
            <span className="meta" style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, fontSize: "0.68rem" }}>
              Live preview
            </span>

            <div
              className="pv-photo"
              style={{
                marginTop: "0.8rem",
                backgroundImage: portfolioPieces[0] ? `linear-gradient(rgba(30,27,41,0.2), rgba(30,27,41,0.7)), url(${portfolioPieces[0].url})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <span className="pv-name">{name.trim() || "Your name"}</span>
            </div>

            <p className="meta">
              {city[0] || "Select city"} · {rateRange}
            </p>
            <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginTop: "0.3rem" }}>
              {tagline.trim() || "Your one-line tagline appears here."}
            </p>

            <div className="chip-row" style={{ marginTop: "0.8rem" }}>
              {[...tools.slice(0, 4), ...specializations.slice(0, 3)].map((item) => (
                <Badge key={item} variant="unpaid">
                  {item}
                </Badge>
              ))}
            </div>

            {/* COMPLETION RING */}
            <div className="completion">
              <div className="ring" style={{ ["--p" as string]: completionPercentage }}>
                <i>{completionPercentage}%</i>
              </div>
              <div>
                <b style={{ fontSize: "0.88rem" }}>Profile completion</b>
                <p className="meta">{completedCount} of 6 fields complete</p>
              </div>
            </div>
          </aside>
        </div>

        {/* SHARE MODAL */}
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Share profile card"
        >
          <div style={{ marginBottom: "1.2rem" }}>
            <SignatureShareCard
              isFreelancer
              freelancerName={name}
              freelancerCity={city[0] || "Mumbai"}
              freelancerRate={rateRange}
              freelancerSkills={tools}
            />
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => showToast("Profile URL copied.")}
            >
              Copy link
            </button>
            <button
              className="btn btn-ghost"
              style={{ flex: 1 }}
              onClick={() => showToast("Profile card generated.")}
            >
              Download card
            </button>
          </div>
        </Modal>
      </div>
    </main>
  );
}
