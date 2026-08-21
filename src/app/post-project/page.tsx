"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMarketplace,
  FORMATS,
  CITIES,
  LANGS,
  SKILLS,
} from "@/lib/store/marketplace-store";
import TokenInput from "@/components/ui/TokenInput";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Modal from "@/components/ui/Modal";
import SignatureShareCard from "@/components/cards/SignatureShareCard";

export default function PostProjectPage() {
  const { session, postProject, showToast } = useMarketplace();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<string[]>([]);
  const [city, setCity] = useState<string[]>([]);

  const [roleTitle, setRoleTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [budgetMin, setBudgetMin] = useState<number | "">("");
  const [budgetMax, setBudgetMax] = useState<number | "">("");
  const [experience, setExperience] = useState("Any");
  const [tools, setTools] = useState<string[]>([]);
  const [additionalSkills, setAdditionalSkills] = useState<string[]>([]);

  const [deadline, setDeadline] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFlexibleDates, setIsFlexibleDates] = useState(false);
  const [interviewMode, setInterviewMode] = useState("Async");

  const [compType, setCompType] = useState<"Fixed price" | "Hourly" | "Unpaid">("Fixed price");
  const [compDetails, setCompDetails] = useState("");
  const [chargesFee, setChargesFee] = useState<"No" | "Yes">("No");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdProjectId, setCreatedProjectId] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const validateStep = (s: number) => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!title.trim()) newErrors.title = "Enter the project title.";
      if (!format.length) newErrors.format = "Select a category.";
      if (!city.length) newErrors.city = "Select a city or Remote.";
    }
    if (s === 2) {
      if (!roleTitle.trim()) newErrors.roleTitle = "Enter the position title.";
      if (desc.trim().length < 20) {
        newErrors.desc = "Describe the project — at least 20 characters.";
      }
      if (budgetMin === "" || isNaN(Number(budgetMin)) || Number(budgetMin) < 0) {
        newErrors.budgetMin = "Required.";
      }
      if (budgetMax === "" || isNaN(Number(budgetMax)) || Number(budgetMax) < 0) {
        newErrors.budgetMax = "Required.";
      }
      if (
        budgetMin !== "" &&
        budgetMax !== "" &&
        Number(budgetMax) < Number(budgetMin)
      ) {
        newErrors.budgetMax = "Must be the same or higher than minimum budget.";
      }
      if (!tools.length) newErrors.tools = "Select at least one skill or tool.";
    }
    if (s === 3) {
      if (!deadline) newErrors.deadline = "Set the closing date.";
      if (!isFlexibleDates) {
        if (!startDate) newErrors.startDate = "Set a project start date.";
        if (!endDate) newErrors.endDate = "Set a project end date.";
        if (startDate && endDate && endDate < startDate) {
          newErrors.endDate = "End date is before the start date.";
        }
        if (startDate && deadline && startDate < deadline) {
          newErrors.startDate = "Project starts before applications close.";
        }
      }
    }
    if (s === 4) {
      if (!compDetails.trim()) {
        newErrors.compDetails = "State the rate, milestones, or coverage.";
      }
      if (chargesFee === "Yes") {
        newErrors.chargesFee = "Listings charging freelancers cannot be published.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
      showToast("Please check the highlighted fields.");
      return;
    }
    if (step < 5) {
      setStep(step + 1);
    } else if (step === 5) {
      const minNum = Number(budgetMin) || 0;
      const maxNum = Number(budgetMax) || 0;
      const budgetText = `₹${minNum.toLocaleString("en-IN")}–${maxNum.toLocaleString("en-IN")}`;
      
      const newId = await postProject({
        rid: session?.rid || "brightloop",
        role: roleTitle,
        project: title,
        format: format[0] || "Web Development",
        city: city[0] || "Remote",
        paid: compType === "Unpaid" ? "Unpaid" : compType === "Hourly" ? "Hourly" : "Paid",
        comp: compDetails,
        deadline: deadline ? new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "Open",
        window: isFlexibleDates ? "Dates not locked" : `${startDate ? new Date(startDate).toLocaleDateString("en-GB", { month: "short" }) : ""}–${endDate ? new Date(endDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : ""}`,
        langs: tools,
        age: budgetText,
        gender: experience,
        mode: interviewMode,
        skills: additionalSkills,
        desc,
        charges_fee: false,
      });
      setCreatedProjectId(newId);
      setStep(6);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const formatWindowText = () => {
    if (isFlexibleDates) return "Dates not locked";
    if (startDate && endDate) {
      return `${startDate} to ${endDate}`;
    }
    return "—";
  };

  return (
    <main className="animate-view-in">
      <div className="container" style={{ paddingBottom: "3rem" }}>
        <div style={{ paddingTop: "1.2rem" }}>
          <span className="eyebrow">Clients</span>
          <h1 className="display" style={{ fontSize: "clamp(1.9rem, 4vw, 2.7rem)" }}>
            Post a project
          </h1>
          <p className="lead" style={{ marginTop: "0.4rem" }}>
            Five steps. The listing becomes a verified public page with an instant share card.
          </p>
        </div>

        <div className="flow-wrap">
          {/* FLOW FORM */}
          <div className="flow-main glass">
            {step <= 5 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="meta">Step {step} of 5</span>
                  <span className="meta">Draft saved</span>
                </div>
                <div className="progress">
                  <i style={{ width: `${(step / 5) * 100}%` }}></i>
                </div>
              </>
            )}

            {/* STEP 1: THE PROJECT */}
            {step === 1 && (
              <div className="fstep">
                <h2 className="display">The project</h2>
                <p className="hint">Appears prominently on the public listing and share card.</p>

                <div className={`field ${errors.title ? "bad" : ""}`}>
                  <label>Project title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g. E-Commerce Mobile App or Brand Redesign"
                  />
                  {errors.title && <div className="err">{errors.title}</div>}
                </div>

                <div className={`field ${errors.format ? "bad" : ""}`}>
                  <label>Category</label>
                  <TokenInput
                    options={FORMATS}
                    selected={format}
                    onChange={(vals) => setFormat(vals.slice(-1))}
                    placeholder="Select category"
                    maxItems={1}
                  />
                  {errors.format && <div className="err">{errors.format}</div>}
                </div>

                <div className={`field ${errors.city ? "bad" : ""}`}>
                  <label>
                    City <span className="sub">— or Remote</span>
                  </label>
                  <TokenInput
                    options={CITIES}
                    selected={city}
                    onChange={(vals) => setCity(vals.slice(-1))}
                    placeholder="Select city or Remote"
                    maxItems={1}
                  />
                  {errors.city && <div className="err">{errors.city}</div>}
                </div>
              </div>
            )}

            {/* STEP 2: THE POSITION */}
            {step === 2 && (
              <div className="fstep">
                <h2 className="display">The position</h2>
                <p className="hint">Detailed scope. Shown in full on the listing.</p>

                <div className={`field ${errors.roleTitle ? "bad" : ""}`}>
                  <label>Position title</label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="E.g. Senior Frontend Engineer or UI/UX Designer"
                  />
                  {errors.roleTitle && <div className="err">{errors.roleTitle}</div>}
                </div>

                <div className={`field ${errors.desc ? "bad" : ""}`}>
                  <label>Description</label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Describe the deliverables, timeline, milestones, and what success looks like…"
                  />
                  {errors.desc && <div className="err">{errors.desc}</div>}
                </div>

                <div className="field-row">
                  <div className={`field ${errors.budgetMin ? "bad" : ""}`}>
                    <label>Budget from (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                      placeholder="50000"
                    />
                    {errors.budgetMin && <div className="err">{errors.budgetMin}</div>}
                  </div>

                  <div className={`field ${errors.budgetMax ? "bad" : ""}`}>
                    <label>Budget to (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                      placeholder="80000"
                    />
                    {errors.budgetMax && <div className="err">{errors.budgetMax}</div>}
                  </div>
                </div>

                <div className="field">
                  <label>Experience level required</label>
                  <SegmentedControl
                    options={["Any", "Junior", "Senior"]}
                    value={experience}
                    onChange={setExperience}
                  />
                </div>

                <div className={`field ${errors.tools ? "bad" : ""}`}>
                  <label>
                    Skills &amp; tools required <span className="sub">— select or type</span>
                  </label>
                  <TokenInput
                    options={LANGS}
                    selected={tools}
                    onChange={setTools}
                    placeholder="Select required tools (e.g. React, Figma, Next.js)"
                  />
                  {errors.tools && <div className="err">{errors.tools}</div>}
                </div>

                <div className="field">
                  <label>
                    Additional skills <span className="sub">— optional</span>
                  </label>
                  <TokenInput
                    options={SKILLS}
                    selected={additionalSkills}
                    onChange={setAdditionalSkills}
                    placeholder="Select additional skills"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: DATES */}
            {step === 3 && (
              <div className="fstep">
                <h2 className="display">Dates</h2>
                <p className="hint">Applications close automatically on the deadline.</p>

                <div className={`field ${errors.deadline ? "bad" : ""}`}>
                  <label>Applications close</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                  {errors.deadline && <div className="err">{errors.deadline}</div>}
                </div>

                <div className="field">
                  <label>Project timeline</label>
                  <div className="date-row">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={isFlexibleDates}
                      aria-label="Project start date"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={isFlexibleDates}
                      aria-label="Project end date"
                    />
                  </div>
                  {errors.startDate && <div className="err">{errors.startDate}</div>}
                  {errors.endDate && <div className="err">{errors.endDate}</div>}

                  <label className="check" style={{ marginTop: "0.5rem" }}>
                    <input
                      type="checkbox"
                      checked={isFlexibleDates}
                      onChange={(e) => setIsFlexibleDates(e.target.checked)}
                    />
                    <span>Dates not locked yet</span>
                  </label>
                </div>

                <div className="field">
                  <label>Interview mode</label>
                  <SegmentedControl
                    options={["Async", "Video call", "Both"]}
                    value={interviewMode}
                    onChange={setInterviewMode}
                  />
                </div>
              </div>
            )}

            {/* STEP 4: COMPENSATION & GUARDRAILS */}
            {step === 4 && (
              <div className="fstep">
                <h2 className="display">Compensation</h2>
                <p className="hint">Every listing states compensation. Unpaid is allowed, blank is not.</p>

                <div className="field">
                  <label>Type</label>
                  <SegmentedControl
                    options={["Fixed price", "Hourly", "Unpaid"]}
                    value={compType}
                    onChange={(val) => setCompType(val as "Fixed price" | "Hourly" | "Unpaid")}
                  />
                </div>

                <div className={`field ${errors.compDetails ? "bad" : ""}`}>
                  <label>
                    Details <span className="sub">— rate, milestones, deliverables</span>
                  </label>
                  <input
                    type="text"
                    value={compDetails}
                    onChange={(e) => setCompDetails(e.target.value)}
                    placeholder="E.g. ₹80,000 fixed, paid in 2 milestones"
                  />
                  {errors.compDetails && <div className="err">{errors.compDetails}</div>}
                </div>

                <div className="field" style={{ marginTop: "1.4rem" }}>
                  <label>Do freelancers pay anything to apply, bid, or be considered?</label>
                  <SegmentedControl
                    options={["No", "Yes"]}
                    value={chargesFee}
                    onChange={(val) => setChargesFee(val as "No" | "Yes")}
                  />
                  {chargesFee === "Yes" && (
                    <div className="guard" style={{ display: "block" }}>
                      <b>This listing cannot be published.</b> Brief strictly prohibits charging
                      freelancers — no bidding fees, subscriptions, or portfolio evaluation charges.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW */}
            {step === 5 && (
              <div className="fstep">
                <h2 className="display">Review &amp; publish</h2>
                <p className="hint">
                  New accounts are checked before the verified badge displays. Typically under 24 hours.
                </p>

                <div className="panel" style={{ background: "rgba(255,255,255,.6)", border: "1px solid var(--line)" }}>
                  <div className="kv">
                    <span>Project</span>
                    <b>
                      {title} ({format[0] || "—"})
                    </b>
                  </div>
                  <div className="kv">
                    <span>Position</span>
                    <b>{roleTitle}</b>
                  </div>
                  <div className="kv">
                    <span>City</span>
                    <b>{city[0] || "—"}</b>
                  </div>
                  <div className="kv">
                    <span>Budget · Experience</span>
                    <b>
                      ₹{Number(budgetMin).toLocaleString("en-IN")}–{Number(budgetMax).toLocaleString("en-IN")} · {experience}
                    </b>
                  </div>
                  <div className="kv">
                    <span>Skills &amp; tools</span>
                    <b>{tools.join(", ") || "—"}</b>
                  </div>
                  <div className="kv">
                    <span>Applications close</span>
                    <b>{deadline || "—"}</b>
                  </div>
                  <div className="kv">
                    <span>Timeline</span>
                    <b>{formatWindowText()}</b>
                  </div>
                  <div className="kv">
                    <span>Interview mode</span>
                    <b>{interviewMode}</b>
                  </div>
                  <div className="kv">
                    <span>Compensation</span>
                    <b>
                      {compType} · {compDetails}
                    </b>
                  </div>
                  <div className="kv">
                    <span>Fees to freelancers</span>
                    <b style={{ color: "var(--ok)" }}>None — verified policy compliance</b>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: SUCCESS */}
            {step === 6 && (
              <div className="fstep success-wrap">
                <div className="success-ico">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="display">Project published</h2>
                <p className="lead" style={{ margin: "0 auto 1.4rem" }}>
                  Your listing is live on Brief. You can share your custom social card below and track applicants on your board.
                </p>
                <div style={{ display: "flex", gap: "0.7rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn btn-primary" onClick={() => setIsShareModalOpen(true)}>
                    Share card
                  </button>
                  <Link href="/board" className="btn btn-ghost">
                    Applications board
                  </Link>
                </div>
              </div>
            )}

            {/* NAV FOOTER */}
            {step <= 5 && (
              <div className="flow-nav">
                <button
                  className="btn btn-quiet"
                  onClick={handleBack}
                  disabled={step === 1}
                >
                  Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={chargesFee === "Yes"}
                >
                  {step === 5 ? "Publish project" : "Continue"}
                </button>
              </div>
            )}
          </div>

          {/* LISTING SUMMARY SIDEBAR */}
          <aside className="preview-card glass-strong" aria-label="Listing summary">
            <span className="meta" style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, fontSize: "0.68rem" }}>
              Listing summary
            </span>

            <h3 className="display" style={{ fontSize: "1.6rem", margin: "0.5rem 0 0.1rem" }}>
              {title.trim() || "Untitled project"}
            </h3>
            <p className="meta">
              {format[0] || "Select category"} · {city[0] || "Select city"}
            </p>

            <div className="sum-list" style={{ marginTop: "0.9rem" }}>
              <div className="kv">
                <span>Position</span>
                <b>{roleTitle || "—"}</b>
              </div>
              <div className="kv">
                <span>Budget · Tools</span>
                <b>
                  {budgetMin !== "" && budgetMax !== "" ? `₹${Number(budgetMin).toLocaleString("en-IN")}–${Number(budgetMax).toLocaleString("en-IN")}` : "—"} · {tools.join(", ") || "—"}
                </b>
              </div>
              <div className="kv">
                <span>Applications close</span>
                <b>{deadline || "—"}</b>
              </div>
              <div className="kv">
                <span>Timeline</span>
                <b>{formatWindowText()}</b>
              </div>
              <div className="kv">
                <span>Compensation</span>
                <b>
                  {compType} {compDetails ? `· ${compDetails}` : ""}
                </b>
              </div>
            </div>
          </aside>
        </div>

        {/* SHARE MODAL */}
        <Modal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Share card"
        >
          <div style={{ marginBottom: "1.2rem" }}>
            <SignatureShareCard
              project={{
                id: createdProjectId || 0,
                rid: session?.rid || "brightloop",
                role: roleTitle || "Position Title",
                project: title || "Project Title",
                format: format[0] || "Web Development",
                city: city[0] || "Remote",
                paid: compType === "Unpaid" ? "Unpaid" : compType === "Hourly" ? "Hourly" : "Paid",
                comp: compDetails || "Competitive",
                deadline: deadline || "Open",
                window: formatWindowText(),
                langs: tools,
                age: `₹${Number(budgetMin).toLocaleString("en-IN")}–${Number(budgetMax).toLocaleString("en-IN")}`,
                gender: experience,
                mode: interviewMode,
                skills: additionalSkills,
                desc,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => showToast("Listing URL copied.")}
            >
              Copy link
            </button>
            <button
              className="btn btn-ghost"
              style={{ flex: 1 }}
              onClick={() => showToast("Share card image downloaded.")}
            >
              Download card
            </button>
          </div>
        </Modal>
      </div>
    </main>
  );
}
