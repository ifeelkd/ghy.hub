"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/lib/store/marketplace-store";
import { createClient } from "@/lib/supabase/client";
import { RoleType } from "@/types";
import { Mail, Lock, User, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

const ROLE_OPTIONS: { k: RoleType; n: string; d: string; i: string }[] = [
  {
    k: "freelancer",
    n: "Freelancer / Educator",
    d: "Build a profile (tech or teaching), apply to gigs, rate clients.",
    i: "F",
  },
  {
    k: "client",
    n: "Client / Institution",
    d: "Post projects or tutoring roles for a school, academy, or company.",
    i: "C",
  },
  {
    k: "indie",
    n: "Independent client / Parent",
    d: "Hire teachers or freelancers as an individual.",
    i: "I",
  },
  {
    k: "admin",
    n: "Admin",
    d: "Verification queue, reports, listing review.",
    i: "A",
  },
];

export default function AuthPage() {
  const { signIn, showToast } = useMarketplace();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");
  
  // Credentials
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  
  // 6-digit real OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
  };

  const routeUser = (role: RoleType) => {
    if (role === "freelancer") {
      router.push("/explore");
    } else if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  // 1. Handle Send Real Email OTP
  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    setAuthError("");
    setIsLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setAuthError("Supabase connection not configured.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          data: {
            name: name.trim() || "User",
            role: selectedRole || "freelancer",
          },
        },
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setStep(3);
        showToast("6-digit verification code sent to your email.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send verification code.";
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Verify Real Email OTP
  const handleVerifyOtp = async () => {
    const code = otp.join("").trim();
    if (code.length < 6) {
      setAuthError("Please enter all 6 digits of the code.");
      return;
    }

    setAuthError("");
    setIsLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setAuthError("Supabase connection not configured.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code,
        type: "email",
      });

      if (error) {
        setAuthError(error.message);
      } else if (data.session) {
        const userRole = selectedRole || "freelancer";
        const userName = name.trim() || data.user?.user_metadata?.name || "Member";
        signIn(userRole, userName);
        showToast("Verified & signed in successfully.");
        routeUser(userRole);
      } else {
        setAuthError("Verification failed. Please request a new code.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed.";
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Email + Password Sign In / Sign Up
  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setAuthError("Email and password are required.");
      return;
    }

    setAuthError("");
    setIsLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setAuthError("Supabase client not available.");
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              name: name.trim() || "User",
              role: selectedRole || "freelancer",
            },
          },
        });

        if (error) {
          setAuthError(error.message);
        } else {
          const userRole = selectedRole || "freelancer";
          const userName = name.trim() || "Member";
          signIn(userRole, userName);
          showToast("Account created successfully!");
          routeUser(userRole);
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          setAuthError(error.message);
        } else if (data.session) {
          const userRole = selectedRole || (data.user?.user_metadata?.role as RoleType) || "freelancer";
          const userName = data.user?.user_metadata?.name || name.trim() || "Member";
          signIn(userRole, userName);
          showToast(`Welcome back, ${userName}!`);
          routeUser(userRole);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication error.";
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, "").slice(-1);
    const updated = [...otp];
    updated[index] = numeric;
    setOtp(updated);

    if (numeric && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <main className="animate-view-in">
      <div className="auth-wrap">
        <div className="auth-card glass-strong">
          {/* STEP 1: ROLE SELECTION */}
          {step === 1 && (
            <div className="fstep on">
              <span className="eyebrow">Brief Authentication</span>
              <h1 className="display" style={{ marginTop: "0.2rem" }}>Select Account Type</h1>
              <p className="hint">
                Choose how you want to participate on the platform.
              </p>

              <div className="role-pick" style={{ marginTop: "1rem" }}>
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
                style={{ width: "100%", marginTop: "1.2rem" }}
                disabled={!selectedRole}
                onClick={() => setStep(2)}
              >
                Continue with {selectedRole ? ROLE_OPTIONS.find((r) => r.k === selectedRole)?.n : "Selection"}
              </button>
            </div>
          )}

          {/* STEP 2: CREDENTIALS */}
          {step === 2 && (
            <div className="fstep on">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  className="btn btn-quiet btn-sm"
                  onClick={() => {
                    setStep(1);
                    setAuthError("");
                  }}
                  style={{ gap: "0.3rem", padding: "0.2rem 0.5rem" }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <span className="badge badge-verify">
                  {ROLE_OPTIONS.find((r) => r.k === selectedRole)?.n}
                </span>
              </div>

              <h1 className="display" style={{ marginTop: "0.8rem" }}>Sign in to Brief</h1>
              <p className="hint">
                Real authentication powered by Supabase.
              </p>

              {/* METHOD TOGGLE */}
              <div
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  background: "rgba(0,0,0,0.04)",
                  padding: "4px",
                  borderRadius: "var(--r-sm)",
                  margin: "1rem 0 1.2rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("otp");
                    setAuthError("");
                  }}
                  style={{
                    flex: 1,
                    padding: "0.5rem 0.8rem",
                    border: "none",
                    borderRadius: "6px",
                    background: authMethod === "otp" ? "#fff" : "transparent",
                    color: authMethod === "otp" ? "var(--ink)" : "var(--muted)",
                    fontWeight: authMethod === "otp" ? 700 : 500,
                    cursor: "pointer",
                    boxShadow: authMethod === "otp" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    fontSize: "0.85rem",
                  }}
                >
                  Email One-Time Code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("password");
                    setAuthError("");
                  }}
                  style={{
                    flex: 1,
                    padding: "0.5rem 0.8rem",
                    border: "none",
                    borderRadius: "6px",
                    background: authMethod === "password" ? "#fff" : "transparent",
                    color: authMethod === "password" ? "var(--ink)" : "var(--muted)",
                    fontWeight: authMethod === "password" ? 700 : 500,
                    cursor: "pointer",
                    boxShadow: authMethod === "password" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    fontSize: "0.85rem",
                  }}
                >
                  Password Login
                </button>
              </div>

              {authError && (
                <div
                  style={{
                    padding: "0.6rem 0.8rem",
                    borderRadius: "var(--r-sm)",
                    background: "rgba(220,38,38,0.1)",
                    color: "#dc2626",
                    fontSize: "0.85rem",
                    marginBottom: "1rem",
                    border: "1px solid rgba(220,38,38,0.2)",
                  }}
                >
                  {authError}
                </div>
              )}

              {/* OPTION A: REAL EMAIL OTP */}
              {authMethod === "otp" ? (
                <div>
                  <div className="field">
                    <label>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <User size={14} /> Full name
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Keerti Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Mail size={14} /> Email address
                      </span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: "1rem" }}
                    disabled={isLoading || !email.includes("@") || !name.trim()}
                    onClick={handleSendOtp}
                  >
                    {isLoading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                        <Loader2 size={16} className="animate-spin" /> Sending verification code...
                      </span>
                    ) : (
                      "Send 6-digit verification code"
                    )}
                  </button>

                  <p className="auth-note">
                    A real one-time 6-digit security code will be sent to your email inbox.
                  </p>
                </div>
              ) : (
                /* OPTION B: EMAIL & PASSWORD */
                <form onSubmit={handlePasswordAuth}>
                  {isSignUp && (
                    <div className="field">
                      <label>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <User size={14} /> Full name
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Keerti Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  )}

                  <div className="field">
                    <label>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Mail size={14} /> Email address
                      </span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Lock size={14} /> Password
                      </span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: "1rem" }}
                    disabled={isLoading || !email.includes("@") || password.length < 6}
                  >
                    {isLoading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                        <Loader2 size={16} className="animate-spin" /> Authenticating...
                      </span>
                    ) : isSignUp ? (
                      "Create Account"
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div style={{ textAlign: "center", marginTop: "1rem" }}>
                    <button
                      type="button"
                      className="btn btn-quiet btn-sm"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setAuthError("");
                      }}
                      style={{ fontSize: "0.82rem" }}
                    >
                      {isSignUp
                        ? "Already have an account? Sign in"
                        : "Don't have an account? Create one"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: REAL OTP VERIFICATION */}
          {step === 3 && (
            <div className="fstep on">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  className="btn btn-quiet btn-sm"
                  onClick={() => {
                    setStep(2);
                    setAuthError("");
                  }}
                  style={{ gap: "0.3rem", padding: "0.2rem 0.5rem" }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              </div>

              <h1 className="display" style={{ marginTop: "0.8rem" }}>Enter 6-Digit Code</h1>
              <p className="hint">
                Code sent to <b>{email}</b>. Please check your inbox or spam folder.
              </p>

              {authError && (
                <div
                  style={{
                    padding: "0.6rem 0.8rem",
                    borderRadius: "var(--r-sm)",
                    background: "rgba(220,38,38,0.1)",
                    color: "#dc2626",
                    fontSize: "0.85rem",
                    marginBottom: "1rem",
                    border: "1px solid rgba(220,38,38,0.2)",
                  }}
                >
                  {authError}
                </div>
              )}

              <div className="otp-row" style={{ marginTop: "1.2rem", justifyContent: "center" }}>
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

              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "1.2rem" }}
                disabled={isLoading || otp.some((d) => !d)}
                onClick={handleVerifyOtp}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <Loader2 size={16} className="animate-spin" /> Verifying code...
                  </span>
                ) : (
                  "Verify & Sign In"
                )}
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                  type="button"
                  className="btn btn-quiet btn-sm"
                  disabled={isLoading}
                  onClick={handleSendOtp}
                  style={{ fontSize: "0.82rem" }}
                >
                  Didn&apos;t receive it? Resend code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
