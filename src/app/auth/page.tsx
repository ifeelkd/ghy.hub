"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/lib/store/marketplace-store";
import { RoleType } from "@/types";

const ROLE_OPTIONS: { k: RoleType; n: string; d: string; i: string }[] = [
  {
    k: "freelancer",
    n: "Freelancer",
    d: "Build a profile, apply to projects, rate clients.",
    i: "F",
  },
  {
    k: "client",
    n: "Client / business",
    d: "Post projects for a company, studio, or agency.",
    i: "C",
  },
  {
    k: "indie",
    n: "Independent client",
    d: "Post projects as an individual.",
    i: "I",
  },
  {
    k: "admin",
    n: "Admin",
    d: "Verification queue, reports, listing review.",
    i: "M",
  },
];

export default function AuthPage() {
  const { signIn, loginAsDemo } = useMarketplace();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
  };

  const handlePhoneChange = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    if (numeric.length <= 10) {
      setPhone(numeric);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, "").slice(-1);
    const updated = [...otp];
    updated[index] = numeric;
    setOtp(updated);

    // Auto hop to next field
    if (numeric && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    if (!selectedRole) return;
    signIn(selectedRole, name.trim() || "Guest User");
    if (selectedRole === "freelancer") {
      router.push("/explore");
    } else if (selectedRole === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  const handleDemoLogin = (role: RoleType) => {
    loginAsDemo(role);
    if (role === "freelancer") {
      router.push("/explore");
    } else if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="animate-view-in">
      <div className="auth-wrap">
        <div className="auth-card glass-strong">
          {/* STEP 1: SELECT ROLE */}
          {step === 1 && (
            <div className="fstep on">
              <h1 className="display">Sign in</h1>
              <p className="hint">
                Select account type. New numbers are registered automatically.
              </p>

              <div className="role-pick">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.k}
                    type="button"
                    className={`role-opt ${selectedRole === opt.k ? "sel" : ""}`}
                    onClick={() => handleRoleSelect(opt.k)}
                  >
                    <span className="rk">{opt.i}</span>
                    <span>
                      <b>{opt.n}</b>
                      <p>{opt.d}</p>
                    </span>
                  </button>
                ))}
              </div>

              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                disabled={!selectedRole}
                onClick={() => setStep(2)}
              >
                Continue
              </button>

              <div className="demo-fill">
                <p>Demo accounts — 1-click test</p>
                <div className="demo-btns">
                  <button
                    className="mini"
                    onClick={() => handleDemoLogin("freelancer")}
                  >
                    Freelancer
                  </button>
                  <button
                    className="mini"
                    onClick={() => handleDemoLogin("client")}
                  >
                    Client / business
                  </button>
                  <button
                    className="mini"
                    onClick={() => handleDemoLogin("indie")}
                  >
                    Independent client
                  </button>
                  <button
                    className="mini"
                    onClick={() => handleDemoLogin("admin")}
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MOBILE NUMBER & NAME */}
          {step === 2 && (
            <div className="fstep on">
              <h1 className="display">Mobile number</h1>
              <p className="hint">
                Signing in as{" "}
                {ROLE_OPTIONS.find((r) => r.k === selectedRole)?.n ||
                  "Freelancer"}
                .
              </p>

              <div className="field">
                <label>Mobile number</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{
                      width: "82px",
                      flex: "0 0 82px",
                      padding: "0.75rem 0.5rem",
                      borderRadius: "var(--r-sm)",
                      border: "1px solid var(--line)",
                      background: "rgba(255,255,255,.75)",
                    }}
                  >
                    <option>+91</option>
                    <option>+971</option>
                    <option>+44</option>
                    <option>+1</option>
                  </select>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    style={{ flex: "1 1 0" }}
                  />
                </div>
              </div>

              <div className="field">
                <label>
                  Full name <span className="sub">— as shown to clients</span>
                </label>
                <input
                  type="text"
                  placeholder="Keerti Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                disabled={phone.length < 10 || name.trim().length < 2}
                onClick={() => setStep(3)}
              >
                Send code
              </button>

              <div
                className="flow-nav"
                style={{ marginTop: "1rem", paddingTop: "1rem" }}
              >
                <button className="btn btn-quiet" onClick={() => setStep(1)}>
                  Back
                </button>
                <span />
              </div>
            </div>
          )}

          {/* STEP 3: OTP CODE */}
          {step === 3 && (
            <div className="fstep on">
              <h1 className="display">Enter code</h1>
              <p className="hint">
                Sent to {countryCode} {phone}.
              </p>

              <div className="otp-row">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    aria-label={`Verification code digit ${idx + 1}`}
                  />
                ))}
              </div>

              <p className="auth-note">
                Prototype: any 4 digits work. Code is simulated for quick verification.
              </p>

              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "1rem" }}
                disabled={otp.some((d) => !d)}
                onClick={handleVerify}
              >
                Verify &amp; Sign in
              </button>

              <div
                className="flow-nav"
                style={{ marginTop: "1rem", paddingTop: "1rem" }}
              >
                <button className="btn btn-quiet" onClick={() => setStep(2)}>
                  Back
                </button>
                <span />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
