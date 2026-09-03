"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  useMarketplace,
  CITIES,
  LANGS,
  SKILLS,
  TEACHING_SUBJECTS,
  EDUCATION_LEVELS,
  EDUCATION_BOARDS,
  TEACHER_QUALIFICATIONS,
  TEACHING_MODES,
  TEACHING_TOOLS,
  LANGUAGES_OF_INSTRUCTION,
} from "@/lib/store/marketplace-store";
import TokenInput from "@/components/ui/TokenInput";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import SignatureShareCard from "@/components/cards/SignatureShareCard";
import { uploadOptimizedImage } from "@/lib/supabase/storage";
import { formatFileSize } from "@/lib/image-optimizer";
import {
  UploadCloud,
  CheckCircle2,
  Trash2,
  GraduationCap,
  Code2,
  Video,
  BookOpen,
  Award,
} from "lucide-react";

interface PortfolioPiece {
  id: string;
  url: string;
  originalSize: number;
  optimizedSize: number;
  reductionPercentage: number;
}

export default function OnboardingPage() {
  const { session, updateFreelancerProfile, showToast } = useMarketplace();

  // Profile category: Teacher / Educator vs Creative / Tech Freelancer
  const [profileCategory, setProfileCategory] = useState<"teacher" | "creative">("teacher");

  const [step, setStep] = useState(1);
  const [name, setName] = useState(session?.name || "");
  const [city, setCity] = useState<string[]>([]);
  const [rateRange, setRateRange] = useState("₹800–1,500/hr");
  const [tagline, setTagline] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Teacher specific fields
  const [subjects, setSubjects] = useState<string[]>(["Mathematics"]);
  const [grades, setGrades] = useState<string[]>(["Secondary (Grades 9–10)", "Senior Secondary (Grades 11–12)"]);
  const [boards, setBoards] = useState<string[]>(["CBSE"]);
  const [qualification, setQualification] = useState("B.Sc / M.Sc in Subject");
  const [teachingMode, setTeachingMode] = useState("Online 1-on-1");
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>(["English", "Hindi"]);
  const [teachingTools, setTeachingTools] = useState<string[]>(["Zoom", "Miro Whiteboard"]);
  const [demoVideoUrl, setDemoVideoUrl] = useState("");
  const [teachingExperience, setTeachingExperience] = useState("3–7 years");

  // Creative / Tech specific fields
  const [creativeTools, setCreativeTools] = useState<string[]>([]);
  const [creativeSkills, setCreativeSkills] = useState<string[]>([]);
  const [creativeExperience, setCreativeExperience] = useState("1–10 projects");

  // Uploaded docs / media
  const [portfolioPieces, setPortfolioPieces] = useState<PortfolioPiece[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Completion calculation
  const isTeacher = profileCategory === "teacher";
  const teacherFlags = [
    !!name.trim(),
    !!tagline.trim(),
    subjects.length > 0,
    grades.length > 0,
    boards.length > 0,
    !!qualification.trim(),
    languagesSpoken.length > 0,
  ];
  const creativeFlags = [
    !!name.trim(),
    !!tagline.trim(),
    portfolioPieces.length >= 1,
    !!portfolioUrl.trim(),
    creativeTools.length > 0,
    creativeSkills.length > 0,
  ];

  const activeFlags = isTeacher ? teacherFlags : creativeFlags;
  const completedCount = activeFlags.filter(Boolean).length;
  const completionPercentage = Math.round(15 + (completedCount / activeFlags.length) * 85);

  const validateStep = (s: number) => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!name.trim()) newErrors.name = "Enter your display name.";
      if (!city.length) newErrors.city = "Select your base city or Remote.";
      if (!tagline.trim()) newErrors.tagline = "Add a short headline summarizing your profile.";
    }
    if (s === 2) {
      if (isTeacher) {
        if (!subjects.length) newErrors.subjects = "Select at least one subject you teach.";
        if (!grades.length) newErrors.grades = "Select target student grade levels.";
        if (!boards.length) newErrors.boards = "Select educational boards/curricula.";
      } else {
        if (!creativeTools.length) newErrors.tools = "Select at least one skill or tool.";
      }
    }
    if (s === 3) {
      if (isTeacher) {
        if (!qualification.trim()) newErrors.qualification = "Select your highest qualification.";
        if (!languagesSpoken.length) newErrors.languages = "Select at least one language of instruction.";
      } else {
        if (portfolioPieces.length < 1 && !portfolioUrl.trim()) {
          newErrors.thumbs = "Add at least one portfolio piece or a portfolio URL.";
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
      showToast("Please check the required fields.");
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      // Save profile
      await updateFreelancerProfile({
        name,
        city: city[0] || "Remote",
        rate_range: rateRange,
        tagline,
        portfolio_url: portfolioUrl,
        portfolio_items: portfolioPieces.map((p) => p.url),
        experience_level: isTeacher ? teachingExperience : creativeExperience,
        is_teacher: isTeacher,
        subjects: isTeacher ? subjects : undefined,
        grades: isTeacher ? grades : undefined,
        boards: isTeacher ? boards : undefined,
        qualification: isTeacher ? qualification : undefined,
        teaching_mode: isTeacher ? teachingMode : undefined,
        languages_spoken: isTeacher ? languagesSpoken : undefined,
        demo_video_url: isTeacher ? demoVideoUrl : undefined,
        tools: isTeacher ? teachingTools : creativeTools,
        skills: isTeacher ? subjects : creativeSkills,
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
      showToast("Maximum 4 items allowed.");
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
      showToast(`Uploaded & optimized ${newPieces.length} file(s).`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to upload file.";
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
          <span className="eyebrow">
            {isTeacher ? "Educator & Teacher Boarding" : "Freelancer Onboarding"}
          </span>
          <h1 className="display" style={{ fontSize: "clamp(1.9rem, 4vw, 2.7rem)" }}>
            {isTeacher ? "Create your Freelance Teacher Profile" : "Build your Freelance Profile"}
          </h1>
          <p className="lead" style={{ marginTop: "0.4rem" }}>
            {isTeacher
              ? "Set your subjects, curricula, grades, credentials, and tutoring fees to receive direct parent & student inquiries."
              : "Four steps. Verified profile with WebP compressed portfolio showcase."}
          </p>
        </div>

        <div className="flow-wrap">
          {/* FLOW FORM */}
          <div className="flow-main glass">
            {/* CATEGORY SWITCH */}
            {step === 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  background: "rgba(0,0,0,0.04)",
                  padding: "4px",
                  borderRadius: "var(--r-sm)",
                  marginBottom: "1.4rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setProfileCategory("teacher")}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 0.8rem",
                    border: "none",
                    borderRadius: "6px",
                    background: isTeacher ? "#fff" : "transparent",
                    color: isTeacher ? "var(--ink)" : "var(--muted)",
                    fontWeight: isTeacher ? 700 : 500,
                    cursor: "pointer",
                    boxShadow: isTeacher ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    fontSize: "0.88rem",
                  }}
                >
                  <GraduationCap size={16} color={isTeacher ? "var(--accent)" : "inherit"} />
                  Teacher / Freelance Educator
                </button>
                <button
                  type="button"
                  onClick={() => setProfileCategory("creative")}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 0.8rem",
                    border: "none",
                    borderRadius: "6px",
                    background: !isTeacher ? "#fff" : "transparent",
                    color: !isTeacher ? "var(--ink)" : "var(--muted)",
                    fontWeight: !isTeacher ? 700 : 500,
                    cursor: "pointer",
                    boxShadow: !isTeacher ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    fontSize: "0.88rem",
                  }}
                >
                  <Code2 size={16} color={!isTeacher ? "var(--accent)" : "inherit"} />
                  Tech / Creative Freelancer
                </button>
              </div>
            )}

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
                <h2 className="display">
                  {isTeacher ? "Educator Profile Basics" : "The basics"}
                </h2>
                <p className="hint">
                  {isTeacher
                    ? "Basic information displayed to students, parents, and coaching institutions."
                    : "Phone number stays private until you choose to share it."}
                </p>

                <div className={`field ${errors.name ? "bad" : ""}`}>
                  <label>
                    {isTeacher ? "Educator name" : "Display name"}
                    <span className="sub"> — as shown on your public profile</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isTeacher ? "e.g. Dr. Keerti Sharma" : "Enter your full name"}
                  />
                  {errors.name && <div className="err">{errors.name}</div>}
                </div>

                <div className={`field ${errors.city ? "bad" : ""}`}>
                  <label>
                    Base city <span className="sub">— select or type your city</span>
                  </label>
                  <TokenInput
                    options={CITIES}
                    selected={city}
                    onChange={(vals) => setCity(vals.slice(-1))}
                    placeholder="Select city (e.g. Remote, Mumbai, Delhi NCR)"
                    maxItems={1}
                  />
                  {errors.city && <div className="err">{errors.city}</div>}
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>
                      {isTeacher ? "Teaching experience" : "Freelancing experience"}
                    </label>
                    {isTeacher ? (
                      <select
                        value={teachingExperience}
                        onChange={(e) => setTeachingExperience(e.target.value)}
                      >
                        <option>New / &lt; 1 year</option>
                        <option>1–3 years</option>
                        <option>3–7 years</option>
                        <option>7+ years (Senior Educator)</option>
                        <option>15+ years (Master Faculty)</option>
                      </select>
                    ) : (
                      <select
                        value={creativeExperience}
                        onChange={(e) => setCreativeExperience(e.target.value)}
                      >
                        <option>New freelancer</option>
                        <option>1–10 projects</option>
                        <option>Established</option>
                      </select>
                    )}
                  </div>

                  <div className="field">
                    <label>{isTeacher ? "Tutoring rate" : "Rate range"}</label>
                    <select
                      value={rateRange}
                      onChange={(e) => setRateRange(e.target.value)}
                    >
                      {isTeacher ? (
                        <>
                          <option>₹500–800/hr</option>
                          <option>₹800–1,500/hr</option>
                          <option>₹1,500–2,500/hr</option>
                          <option>₹2,500+/hr</option>
                          <option>Monthly batch fee</option>
                          <option>Negotiable per course</option>
                        </>
                      ) : (
                        <>
                          <option>₹500–1,000/hr</option>
                          <option>₹1,000–2,500/hr</option>
                          <option>₹2,500–5,000/hr</option>
                          <option>₹5,000+/hr</option>
                          <option>Project-based only</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className={`field ${errors.tagline ? "bad" : ""}`}>
                  <label>
                    Headline / Tagline <span className="sub">— highlights your core expertise</span>
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder={
                      isTeacher
                        ? "e.g. CBSE & IB Senior Physics Mentor | 6+ Yrs Exp | Concept-focused tutoring"
                        : "e.g. Full-stack developer specialising in React and Next.js"
                    }
                  />
                  {errors.tagline && <div className="err">{errors.tagline}</div>}
                </div>
              </div>
            )}

            {/* STEP 2: TEACHING SPECIALIZATIONS (TEACHER) vs SKILLS (CREATIVE) */}
            {step === 2 && (
              <div className="fstep">
                {isTeacher ? (
                  <>
                    <h2 className="display">Subjects &amp; Curricula</h2>
                    <p className="hint">
                      Parents and students search directly by subjects, grades, and boards.
                    </p>

                    <div className={`field ${errors.subjects ? "bad" : ""}`}>
                      <label>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <BookOpen size={15} /> Subjects taught
                        </span>
                      </label>
                      <TokenInput
                        options={TEACHING_SUBJECTS}
                        selected={subjects}
                        onChange={setSubjects}
                        placeholder="Select or type subjects (e.g. Mathematics, Physics, SAT Prep)"
                      />
                      {errors.subjects && <div className="err">{errors.subjects}</div>}
                    </div>

                    <div className={`field ${errors.grades ? "bad" : ""}`}>
                      <label>Target student grades / education levels</label>
                      <TokenInput
                        options={EDUCATION_LEVELS}
                        selected={grades}
                        onChange={setGrades}
                        placeholder="Select target grades (e.g. Grades 9–10, Grades 11–12)"
                      />
                      {errors.grades && <div className="err">{errors.grades}</div>}
                    </div>

                    <div className={`field ${errors.boards ? "bad" : ""}`}>
                      <label>Educational boards &amp; curricula</label>
                      <TokenInput
                        options={EDUCATION_BOARDS}
                        selected={boards}
                        onChange={setBoards}
                        placeholder="Select boards (e.g. CBSE, ICSE, IB, Cambridge)"
                      />
                      {errors.boards && <div className="err">{errors.boards}</div>}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="display">Skills &amp; tools</h2>
                    <p className="hint">
                      Clients filter by these. Select from the list or type to add your own.
                    </p>

                    <div className={`field ${errors.tools ? "bad" : ""}`}>
                      <label>Skills &amp; tools you use</label>
                      <TokenInput
                        options={LANGS}
                        selected={creativeTools}
                        onChange={setCreativeTools}
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
                        selected={creativeSkills}
                        onChange={setCreativeSkills}
                        placeholder="Select specializations (e.g. SEO, API Integration)"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 3: QUALIFICATIONS & MODE (TEACHER) vs PORTFOLIO (CREATIVE) */}
            {step === 3 && (
              <div className="fstep">
                {isTeacher ? (
                  <>
                    <h2 className="display">Qualifications &amp; Teaching Mode</h2>
                    <p className="hint">
                      Verify your educational background, teaching modes, and languages.
                    </p>

                    <div className={`field ${errors.qualification ? "bad" : ""}`}>
                      <label>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Award size={15} /> Highest educational qualification
                        </span>
                      </label>
                      <select
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                      >
                        {TEACHER_QUALIFICATIONS.map((q) => (
                          <option key={q} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                      {errors.qualification && <div className="err">{errors.qualification}</div>}
                    </div>

                    <div className="field">
                      <label>Teaching mode</label>
                      <SegmentedControl
                        options={TEACHING_MODES.slice(0, 4)}
                        value={teachingMode}
                        onChange={setTeachingMode}
                      />
                    </div>

                    <div className={`field ${errors.languages ? "bad" : ""}`}>
                      <label>Languages of instruction</label>
                      <TokenInput
                        options={LANGUAGES_OF_INSTRUCTION}
                        selected={languagesSpoken}
                        onChange={setLanguagesSpoken}
                        placeholder="Select teaching languages (e.g. English, Hindi)"
                      />
                      {errors.languages && <div className="err">{errors.languages}</div>}
                    </div>

                    <div className="field">
                      <label>
                        Teaching tools &amp; digital whiteboard
                        <span className="sub"> — optional</span>
                      </label>
                      <TokenInput
                        options={TEACHING_TOOLS}
                        selected={teachingTools}
                        onChange={setTeachingTools}
                        placeholder="Select tools (e.g. Zoom, Miro, GeoGebra, Google Classroom)"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="display">Portfolio &amp; work samples</h2>
                    <p className="hint">
                      Upload files or add your portfolio link. Images are compressed to WebP.
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
                      <b>{isUploading ? "Compressing & Uploading..." : "Upload Portfolio Images"}</b>
                      <span>JPG, PNG, WebP (Auto-compressed to ~60KB) · {portfolioPieces.length}/4 added</span>
                    </div>
                    {errors.thumbs && <div className="err">{errors.thumbs}</div>}

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
                  </>
                )}
              </div>
            )}

            {/* STEP 4: DEMO CLASS & MEDIA */}
            {step === 4 && (
              <div className="fstep">
                <h2 className="display">
                  {isTeacher ? "Demo Lecture & Verification" : "Review & Publish"}
                </h2>
                <p className="hint">
                  {isTeacher
                    ? "Add a demo class video or sample lesson plan to increase student conversion by 3x."
                    : "Publishing makes your profile public. You can update or unpublish anytime."}
                </p>

                {isTeacher && (
                  <>
                    <div className="field">
                      <label>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Video size={15} /> Demo class or intro video link
                          <span className="sub"> — optional (YouTube, Loom, Google Drive)</span>
                        </span>
                      </label>
                      <input
                        type="url"
                        value={demoVideoUrl}
                        onChange={(e) => setDemoVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=... or https://loom.com/..."
                      />
                    </div>

                    <div className="field">
                      <label>
                        Teaching profile / notes link
                        <span className="sub"> — LinkedIn, Drive folder, personal website</span>
                      </label>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://drive.google.com/... or https://linkedin.com/in/..."
                      />
                    </div>
                  </>
                )}

                <div className="panel" style={{ background: "rgba(255,255,255,.6)", border: "1px solid var(--line)", marginTop: "1rem" }}>
                  <div className="kv">
                    <span>{isTeacher ? "Educator" : "Freelancer"}</span>
                    <b>{name || "—"}</b>
                  </div>
                  <div className="kv">
                    <span>City · Rate</span>
                    <b>{city[0] || "Remote"} · {rateRange}</b>
                  </div>
                  {isTeacher ? (
                    <>
                      <div className="kv">
                        <span>Subjects</span>
                        <b>{subjects.join(", ") || "—"}</b>
                      </div>
                      <div className="kv">
                        <span>Grades &amp; Boards</span>
                        <b>{grades.join(", ")} ({boards.join(", ")})</b>
                      </div>
                      <div className="kv">
                        <span>Qualification</span>
                        <b>{qualification}</b>
                      </div>
                      <div className="kv">
                        <span>Teaching mode</span>
                        <b>{teachingMode}</b>
                      </div>
                      <div className="kv">
                        <span>Languages</span>
                        <b>{languagesSpoken.join(", ")}</b>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="kv">
                        <span>Skills &amp; tools</span>
                        <b>{creativeTools.join(", ") || "—"}</b>
                      </div>
                      <div className="kv">
                        <span>Portfolio link</span>
                        <b>{portfolioUrl ? "Added" : "None"}</b>
                      </div>
                    </>
                  )}
                  <div className="kv">
                    <span>Visibility</span>
                    <b>Public · Searchable · Direct Contact</b>
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
                <h2 className="display">
                  {isTeacher ? "Educator Profile Published" : "Profile Published"}
                </h2>
                <p className="lead" style={{ margin: "0 auto 1.4rem" }}>
                  {isTeacher
                    ? "Your teacher profile is live! Students and parents can now discover your subjects and contact you directly."
                    : "Your freelance profile is live and verified. You can now apply directly to all open projects."}
                </p>
                <div style={{ display: "flex", gap: "0.7rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/explore" className="btn btn-primary">
                    View open listings
                  </Link>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setIsShareModalOpen(true)}
                  >
                    View &amp; share card
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
            <span
              className="meta"
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 700,
                fontSize: "0.68rem",
                color: isTeacher ? "var(--accent)" : "inherit",
              }}
            >
              {isTeacher ? "Educator Live Preview" : "Freelancer Live Preview"}
            </span>

            <div style={{ marginTop: "1rem" }}>
              <SignatureShareCard
                isFreelancer
                isTeacher={isTeacher}
                freelancerName={name.trim() || (isTeacher ? "Your Educator Name" : "Your Name")}
                freelancerCity={city[0] || "Remote"}
                freelancerRate={rateRange}
                freelancerSkills={isTeacher ? subjects : creativeTools}
                teacherSubjects={subjects}
                teacherQualification={qualification}
                teacherMode={teachingMode}
              />
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "1rem", lineHeight: 1.4 }}>
              {tagline.trim() || (isTeacher ? "Your teaching headline appears here." : "Your tagline appears here.")}
            </p>

            {isTeacher && boards.length > 0 && (
              <div style={{ marginTop: "0.8rem", display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                {boards.map((b) => (
                  <Badge key={b} variant="unpaid">
                    {b}
                  </Badge>
                ))}
                {languagesSpoken.slice(0, 2).map((l) => (
                  <Badge key={l} variant="verify">
                    {l}
                  </Badge>
                ))}
              </div>
            )}

            {/* COMPLETION RING */}
            <div className="completion" style={{ marginTop: "1.4rem" }}>
              <div className="ring" style={{ ["--p" as string]: completionPercentage }}>
                <i>{completionPercentage}%</i>
              </div>
              <div>
                <b style={{ fontSize: "0.88rem" }}>Profile strength</b>
                <p className="meta">{completedCount} of {activeFlags.length} fields filled</p>
              </div>
            </div>
          </aside>
        </div>

        {/* SHARE MODAL */}
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={isTeacher ? "Share educator card" : "Share profile card"}
        >
          <div style={{ marginBottom: "1.2rem" }}>
            <SignatureShareCard
              isFreelancer
              isTeacher={isTeacher}
              freelancerName={name}
              freelancerCity={city[0] || "Remote"}
              freelancerRate={rateRange}
              freelancerSkills={isTeacher ? subjects : creativeTools}
              teacherSubjects={subjects}
              teacherQualification={qualification}
              teacherMode={teachingMode}
            />
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => showToast("Profile URL copied to clipboard.")}
            >
              Copy link
            </button>
            <button
              className="btn btn-ghost"
              style={{ flex: 1 }}
              onClick={() => showToast("Card image ready for sharing.")}
            >
              Share card
            </button>
          </div>
        </Modal>
      </div>
    </main>
  );
}
