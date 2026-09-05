"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMarketplace } from "@/lib/store/marketplace-store";
import { createClient } from "@/lib/supabase/client";
import { RoleType } from "@/types";
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link2,
} from "lucide-react";

const ROLE_OPTIONS: { k: RoleType; n: string; d: string; i: string }[] = [
  {
    k: "freelancer",
    n: "Freelancer / Educator",
    d: "Build a profile (tech, creative, or tutoring), apply to gigs, and rate clients.",
    i: "F",
  },
  {
    k: "client",
    n: "Client / Institution",
    d: "Post projects or tutoring roles for a school, academy, studio, or company.",
    i: "C",
  },
  {
    k: "indie",
    n: "Independent / Parent",
    d: "Hire teachers, individual specialists, or tutors directly as an individual.",
    i: "I",
  },
];

function AuthPageInner() {
  const { signIn, showToast } = useMarketplace();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Top-level mode: "signin" for existing users, "signup" for new users
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // For sign up: Step 1 (Role) -> Step 2 (Credentials)
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);

  // Method: "otp" (6-digit code) or "password"
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");

  // Credentials
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordForOtp, setNewPasswordForOtp] = useState("");

  // OTP State
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Error handling from callback URL
  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "auth_failed") setAuthError("Authentication link expired or invalid. Please try again.");
    if (err === "no_user") setAuthError("Could not verify your identity. Please try again.");
  }, [searchParams]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const routeUser = async (supabase: ReturnType<typeof createClient>) => {
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAuthError("Could not verify user account. Please try again.");
      return;
    }

    // Check if user has an existing profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, name")
      .eq("id", user.id)
      .single();

    if (profile) {
      // Existing / returning user
      const role = (profile.role as RoleType) || "freelancer";
      const userName = (profile.name as string) || user.user_metadata?.name || user.email || "Member";
      signIn(role, userName);
      showToast(`Welcome back, ${userName}! 👋`);
      if (role === "admin") router.push("/admin");
      else if (role === "freelancer") router.push("/explore");
      else router.push("/dashboard");
    } else {
      // New user — must complete onboarding
      const userRole = selectedRole || (user.user_metadata?.role as RoleType) || "freelancer";
      const userName = name.trim() || user.user_metadata?.name || user.email || "Member";
      signIn(userRole, userName);
      showToast("Account created! Let's set up your profile. 🎉");
      router.push("/onboarding");
    }
  };

  // Helper to detect if user entered a phone number vs email
  const isPhoneInput = (val: string) => {
    const cleaned = val.trim();
    if (/[a-zA-Z@]/.test(cleaned)) return false;
    const digits = cleaned.replace(/\D/g, "");
    return digits.length >= 7;
  };

  const formatPhone = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.startsWith("+")) return trimmed;
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
  };

  // ── 1. SEND OTP CODE (EMAIL OR PHONE) ──────────────────────
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = email.trim();
    if (!cleanInput) {
      setAuthError("Please enter your email address or phone number.");
      return;
    }

    const isPhone = isPhoneInput(cleanInput);
    if (!isPhone && !cleanInput.includes("@")) {
      setAuthError("Please enter a valid email address or phone number.");
      return;
    }

    if (authMode === "signup") {
      if (!name.trim()) {
        setAuthError("Please enter your full name.");
        return;
      }
      if (newPasswordForOtp && newPasswordForOtp.length < 6) {
        setAuthError("Password must be at least 6 characters.");
        return;
      }
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
      const isSigningUp = authMode === "signup";

      if (isPhone) {
        const phone = formatPhone(cleanInput);
        const { error } = await supabase.auth.signInWithOtp({
          phone,
          options: {
            shouldCreateUser: isSigningUp,
            data: isSigningUp
              ? {
                  name: name.trim() || "User",
                  role: selectedRole || "freelancer",
                }
              : undefined,
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes("signups not allowed")) {
            setAuthError("No account found with this phone number. Switch to 'Create Account' to sign up.");
          } else {
            setAuthError(error.message);
          }
        } else {
          setOtpSent(true);
          setResendCooldown(30);
          showToast(`Verification code sent to ${phone}!`);
        }
      } else {
        const cleanEmail = cleanInput.toLowerCase();
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            shouldCreateUser: isSigningUp,
            data: isSigningUp
              ? {
                  name: name.trim() || "User",
                  role: selectedRole || "freelancer",
                }
              : undefined,
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes("signups not allowed")) {
            setAuthError("No account found with this email. Switch to 'Create Account' to sign up.");
          } else {
            setAuthError(error.message);
          }
        } else {
          setOtpSent(true);
          setResendCooldown(30);
          showToast(`Verification code sent to ${cleanEmail}!`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send verification code.";
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── 2. VERIFY OTP CODE (SUPPORTS 4 TO 8 DIGITS) ────────────
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = email.trim();
    const cleanCode = otpCode.trim();

    if (!cleanCode || cleanCode.length < 4) {
      setAuthError("Please enter the verification code (at least 4 digits).");
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
      const isPhone = isPhoneInput(cleanInput);

      const { error } = isPhone
        ? await supabase.auth.verifyOtp({
            phone: formatPhone(cleanInput),
            token: cleanCode,
            type: "sms",
          })
        : await supabase.auth.verifyOtp({
            email: cleanInput.toLowerCase(),
            token: cleanCode,
            type: "email",
          });

      if (error) {
        setAuthError(error.message || "Invalid or expired verification code.");
        setIsLoading(false);
        return;
      }

      // If this was a sign up and the user provided an optional password, save it
      if (authMode === "signup" && newPasswordForOtp && newPasswordForOtp.length >= 6) {
        try {
          await supabase.auth.updateUser({ password: newPasswordForOtp });
        } catch (pwErr) {
          console.warn("Could not set password after OTP verification:", pwErr);
        }
      }

      await routeUser(supabase);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed.";
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── 3. PASSWORD AUTH (SIGN IN OR SIGN UP) ─────────────────
  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setAuthError("Password is required.");
      return;
    }

    if (authMode === "signup") {
      if (!name.trim()) {
        setAuthError("Please enter your full name.");
        return;
      }
      if (password.length < 6) {
        setAuthError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setAuthError("Passwords do not match.");
        return;
      }
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
      if (authMode === "signup") {
        // Sign Up with password
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              name: name.trim(),
              role: selectedRole || "freelancer",
            },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes("already registered")) {
            setAuthError("This email is already registered. Please sign in instead.");
            setAuthMode("signin");
          } else {
            setAuthError(error.message);
          }
        } else {
          // Direct sign-in attempt (works if email confirmation is disabled)
          const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (!loginErr && loginData.session) {
            await routeUser(supabase);
          } else {
            // Confirmation email sent
            setOtpSent(true);
            showToast("Please check your email to confirm your account.");
          }
        }
      } else {
        // Sign In with password
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          if (
            error.message.toLowerCase().includes("invalid login credentials") ||
            error.message.toLowerCase().includes("invalid credentials")
          ) {
            // Check if user exists
            const checkRes = await supabase.auth.signInWithOtp({
              email: cleanEmail,
              options: { shouldCreateUser: false },
            });
            if (checkRes.error?.message?.toLowerCase().includes("signups not allowed")) {
              setAuthError("No account found for this email. Switch to 'Create Account' to sign up.");
            } else {
              setAuthError("Incorrect password. Try again or use 6-digit Email OTP.");
            }
          } else {
            setAuthError(error.message);
          }
        } else if (data.session) {
          await routeUser(supabase);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication error.";
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="animate-view-in">
      <div className="auth-wrap">
        <div className="auth-card glass-strong">

          {/* TOP MODE TOGGLE: SIGN IN (EXISTING USER) vs CREATE ACCOUNT (NEW USER) */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "rgba(0,0,0,0.05)",
              padding: "4px",
              borderRadius: "var(--r-sm)",
              marginBottom: "1.4rem",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setAuthError("");
                setOtpSent(false);
                setOtpCode("");
              }}
              style={{
                flex: 1,
                padding: "0.55rem 0.8rem",
                border: "none",
                borderRadius: "6px",
                background: authMode === "signin" ? "#fff" : "transparent",
                color: authMode === "signin" ? "var(--ink)" : "var(--muted)",
                fontWeight: authMode === "signin" ? 700 : 500,
                cursor: "pointer",
                boxShadow: authMode === "signin" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                fontSize: "0.88rem",
                transition: "all 0.15s ease",
              }}
            >
              Sign In (Existing User)
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setSignupStep(1);
                setAuthError("");
                setOtpSent(false);
                setOtpCode("");
              }}
              style={{
                flex: 1,
                padding: "0.55rem 0.8rem",
                border: "none",
                borderRadius: "6px",
                background: authMode === "signup" ? "#fff" : "transparent",
                color: authMode === "signup" ? "var(--ink)" : "var(--muted)",
                fontWeight: authMode === "signup" ? 700 : 500,
                cursor: "pointer",
                boxShadow: authMode === "signup" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                fontSize: "0.88rem",
                transition: "all 0.15s ease",
              }}
            >
              Create Account (New User)
            </button>
          </div>

          {/* ERROR BANNER */}
          {authError && (
            <div
              style={{
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--r-sm)",
                background: "rgba(220,38,38,0.08)",
                color: "#dc2626",
                fontSize: "0.85rem",
                marginBottom: "1.2rem",
                border: "1px solid rgba(220,38,38,0.2)",
                display: "flex",
                gap: "0.5rem",
                alignItems: "flex-start",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>{authError}</div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              FLOW A: SIGN IN (EXISTING USER)
              Direct access without selecting role!
          ══════════════════════════════════════════════════════ */}
          {authMode === "signin" && (
            <div className="fstep on">
              <h1 className="display" style={{ marginTop: "0.2rem" }}>
                Welcome Back
              </h1>
              <p className="hint">
                Sign in to your Brief account. Your role and profile are loaded automatically.
              </p>

              {/* METHOD SWITCHER */}
              <div
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  background: "rgba(0,0,0,0.03)",
                  padding: "3px",
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
                    padding: "0.45rem 0.7rem",
                    border: "none",
                    borderRadius: "6px",
                    background: authMethod === "otp" ? "#fff" : "transparent",
                    color: authMethod === "otp" ? "var(--ink)" : "var(--muted)",
                    fontWeight: authMethod === "otp" ? 700 : 500,
                    cursor: "pointer",
                    fontSize: "0.84rem",
                    boxShadow: authMethod === "otp" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  🔢 OTP Code (Email / Phone)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("password");
                    setAuthError("");
                    setOtpSent(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "0.45rem 0.7rem",
                    border: "none",
                    borderRadius: "6px",
                    background: authMethod === "password" ? "#fff" : "transparent",
                    color: authMethod === "password" ? "var(--ink)" : "var(--muted)",
                    fontWeight: authMethod === "password" ? 700 : 500,
                    cursor: "pointer",
                    fontSize: "0.84rem",
                    boxShadow: authMethod === "password" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  🔒 Password
                </button>
              </div>

              {/* 1. EXISTING USER: OTP FLOW */}
              {authMethod === "otp" && (
                <div>
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp}>
                      <div className="field">
                        <label>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <Mail size={14} /> Registered Email or Phone Number
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="name@example.com or +91 9876543210"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "1rem" }}
                        disabled={isLoading || !email.trim()}
                      >
                        {isLoading ? (
                          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                            <Loader2 size={16} className="animate-spin" /> Sending Code…
                          </span>
                        ) : (
                          "Send OTP Code"
                        )}
                      </button>

                      <p className="auth-note" style={{ textAlign: "center", marginTop: "0.9rem", fontSize: "0.8rem" }}>
                        Enter your registered email or phone to receive a verification code.
                      </p>
                    </form>
                  ) : (
                    /* OTP VERIFICATION STEP */
                    <form onSubmit={handleVerifyOtp} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: "rgba(22,163,74,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 0.8rem",
                        }}
                      >
                        <CheckCircle2 size={24} color="#16a34a" />
                      </div>

                      <h3 style={{ margin: "0 0 0.3rem", fontSize: "1.05rem" }}>Enter Verification Code</h3>
                      <p className="hint" style={{ fontSize: "0.84rem", margin: "0 0 1.2rem" }}>
                        We sent a verification code to <b>{email}</b>
                      </p>

                      <div className="field" style={{ margin: "0 auto 1.2rem", maxWidth: "260px" }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={8}
                          placeholder="••••"
                          value={otpCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setOtpCode(val);
                          }}
                          style={{
                            textAlign: "center",
                            fontSize: "1.6rem",
                            fontWeight: 700,
                            letterSpacing: "0.35em",
                            padding: "0.6rem 0.5rem",
                          }}
                          autoFocus
                          required
                        />
                      </div>

                      <button
                        id="btn-verify-otp"
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={isLoading || otpCode.trim().length < 4}
                      >
                        {isLoading ? (
                          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                            <Loader2 size={16} className="animate-spin" /> Verifying…
                          </span>
                        ) : (
                          "Verify & Sign In"
                        )}
                      </button>

                      <div style={{ marginTop: "1rem", fontSize: "0.82rem", color: "var(--muted)" }}>
                        Didn&apos;t receive code?{" "}
                        {resendCooldown > 0 ? (
                          <span>Resend in {resendCooldown}s</span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-quiet btn-sm"
                            style={{ display: "inline", padding: "0 2px", fontSize: "0.82rem" }}
                            onClick={() => handleSendOtp()}
                          >
                            Resend Code
                          </button>
                        )}
                        <div style={{ marginTop: "0.5rem" }}>
                          <button
                            type="button"
                            className="btn btn-quiet btn-sm"
                            style={{ display: "inline", padding: 0, fontSize: "0.78rem", color: "var(--faint)" }}
                            onClick={() => {
                              setOtpSent(false);
                              setOtpCode("");
                              setAuthError("");
                            }}
                          >
                            Change email or phone
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* 2. EXISTING USER: PASSWORD FLOW */}
              {authMethod === "password" && (
                <form onSubmit={handlePasswordAuth}>
                  <div className="field">
                    <label>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Mail size={14} /> Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
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
                        <Loader2 size={16} className="animate-spin" /> Signing in…
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              FLOW B: CREATE ACCOUNT (NEW USER)
              Step 1: Role Selection (NO Admin!)
              Step 2: Credentials (OTP or Password + Option to set password)
          ══════════════════════════════════════════════════════ */}
          {authMode === "signup" && (
            <div>
              {/* STEP 1: ROLE SELECTION */}
              {signupStep === 1 && (
                <div className="fstep on">
                  <span className="eyebrow">Join Brief</span>
                  <h1 className="display" style={{ marginTop: "0.2rem" }}>
                    Select Account Type
                  </h1>
                  <p className="hint">Choose how you want to participate on the platform.</p>

                  <div className="role-pick" style={{ marginTop: "1rem" }}>
                    {ROLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.k}
                        type="button"
                        className={`role-opt ${selectedRole === opt.k ? "sel" : ""}`}
                        onClick={() => setSelectedRole(opt.k)}
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
                    onClick={() => setSignupStep(2)}
                  >
                    Continue as{" "}
                    {selectedRole
                      ? ROLE_OPTIONS.find((r) => r.k === selectedRole)?.n
                      : "…"}
                  </button>
                </div>
              )}

              {/* STEP 2: SIGN UP CREDENTIALS */}
              {signupStep === 2 && (
                <div className="fstep on">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <button
                      className="btn btn-quiet btn-sm"
                      onClick={() => {
                        setSignupStep(1);
                        setAuthError("");
                        setOtpSent(false);
                      }}
                      style={{ gap: "0.3rem", padding: "0.2rem 0.5rem" }}
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <span className="badge badge-verify">
                      {ROLE_OPTIONS.find((r) => r.k === selectedRole)?.n}
                    </span>
                  </div>

                  <h1 className="display" style={{ marginTop: "0.8rem" }}>
                    Create Account
                  </h1>
                  <p className="hint">
                    Set up your verified profile details to get started.
                  </p>

                  {/* METHOD TOGGLE */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                      background: "rgba(0,0,0,0.03)",
                      padding: "3px",
                      borderRadius: "var(--r-sm)",
                      margin: "1rem 0 1.2rem",
                    }}
                  >
                    <button
                      key="otp"
                      type="button"
                      onClick={() => {
                        setAuthMethod("otp");
                        setAuthError("");
                        setOtpSent(false);
                      }}
                      style={{
                        flex: 1,
                        padding: "0.45rem 0.7rem",
                        border: "none",
                        borderRadius: "6px",
                        background: authMethod === "otp" ? "#fff" : "transparent",
                        color: authMethod === "otp" ? "var(--ink)" : "var(--muted)",
                        fontWeight: authMethod === "otp" ? 700 : 500,
                        cursor: "pointer",
                        fontSize: "0.84rem",
                        boxShadow: authMethod === "otp" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                      }}
                    >
                      🔢 OTP Code (Email / Phone)
                    </button>

                    <button
                      key="password"
                      type="button"
                      onClick={() => {
                        setAuthMethod("password");
                        setAuthError("");
                        setOtpSent(false);
                      }}
                      style={{
                        flex: 1,
                        padding: "0.45rem 0.7rem",
                        border: "none",
                        borderRadius: "6px",
                        background: authMethod === "password" ? "#fff" : "transparent",
                        color: authMethod === "password" ? "var(--ink)" : "var(--muted)",
                        fontWeight: authMethod === "password" ? 700 : 500,
                        cursor: "pointer",
                        fontSize: "0.84rem",
                        boxShadow: authMethod === "password" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                      }}
                    >
                      🔒 Password
                    </button>
                  </div>

                  {/* 1. SIGN UP WITH OTP */}
                  {authMethod === "otp" && (
                    <div>
                      {!otpSent ? (
                        <form onSubmit={handleSendOtp}>
                          <div className="field">
                            <label>
                              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <User size={14} /> Full Name
                              </span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Keerti Sharma"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              autoFocus
                            />
                          </div>

                          <div className="field">
                            <label>
                              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <Mail size={14} /> Email Address or Phone Number
                              </span>
                            </label>
                            <input
                              type="text"
                              placeholder="name@example.com or +91 9876543210"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>

                          {/* OPTIONAL PASSWORD CREATION FOR NEW USERS */}
                          <div className="field">
                            <label>
                              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <Lock size={14} /> Set a Password <span className="sub">(Optional — so you can also log in with password)</span>
                              </span>
                            </label>
                            <input
                              type="password"
                              placeholder="Create a password (min 6 characters)"
                              value={newPasswordForOtp}
                              onChange={(e) => setNewPasswordForOtp(e.target.value)}
                              minLength={6}
                            />
                          </div>

                          <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%", marginTop: "1rem" }}
                            disabled={isLoading || !email.trim() || !name.trim()}
                          >
                            {isLoading ? (
                              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                <Loader2 size={16} className="animate-spin" /> Sending Code…
                              </span>
                            ) : (
                              "Send OTP Code"
                            )}
                          </button>

                          <p className="auth-note" style={{ textAlign: "center", marginTop: "0.9rem", fontSize: "0.8rem" }}>
                            We will send a verification code to your email or phone.
                          </p>
                        </form>
                      ) : (
                        /* OTP VERIFICATION STEP FOR SIGNUP */
                        <form onSubmit={handleVerifyOtp} style={{ textAlign: "center" }}>
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              background: "rgba(22,163,74,0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              margin: "0 auto 0.8rem",
                            }}
                          >
                            <CheckCircle2 size={24} color="#16a34a" />
                          </div>

                          <h3 style={{ margin: "0 0 0.3rem", fontSize: "1.05rem" }}>Enter Verification Code</h3>
                          <p className="hint" style={{ fontSize: "0.84rem", margin: "0 0 1.2rem" }}>
                            We sent a verification code to <b>{email}</b>
                          </p>

                          <div className="field" style={{ margin: "0 auto 1.2rem", maxWidth: "260px" }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={8}
                              placeholder="••••"
                              value={otpCode}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                setOtpCode(val);
                              }}
                              style={{
                                textAlign: "center",
                                fontSize: "1.6rem",
                                fontWeight: 700,
                                letterSpacing: "0.35em",
                                padding: "0.6rem 0.5rem",
                              }}
                              autoFocus
                              required
                            />
                          </div>

                          <button
                            id="btn-verify-otp-signup"
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%" }}
                            disabled={isLoading || otpCode.trim().length < 4}
                          >
                            {isLoading ? (
                              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                <Loader2 size={16} className="animate-spin" /> Verifying…
                              </span>
                            ) : (
                              "Verify & Create Account"
                            )}
                          </button>

                          <div style={{ marginTop: "1rem", fontSize: "0.82rem", color: "var(--muted)" }}>
                            Didn&apos;t receive code?{" "}
                            {resendCooldown > 0 ? (
                              <span>Resend in {resendCooldown}s</span>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-quiet btn-sm"
                                style={{ display: "inline", padding: "0 2px", fontSize: "0.82rem" }}
                                onClick={() => handleSendOtp()}
                              >
                                Resend Code
                              </button>
                            )}
                            <div style={{ marginTop: "0.5rem" }}>
                              <button
                                type="button"
                                className="btn btn-quiet btn-sm"
                                style={{ display: "inline", padding: 0, fontSize: "0.78rem", color: "var(--faint)" }}
                                onClick={() => {
                                  setOtpSent(false);
                                  setOtpCode("");
                                  setAuthError("");
                                }}
                              >
                                Change email or phone
                              </button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* 2. SIGN UP WITH PASSWORD */}
                  {authMethod === "password" && (
                    <form onSubmit={handlePasswordAuth}>
                      <div className="field">
                        <label>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <User size={14} /> Full Name
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Keerti Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>

                      <div className="field">
                        <label>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <Mail size={14} /> Email Address
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
                          placeholder="Create password (min 6 characters)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                      </div>

                      <div className="field">
                        <label>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <Lock size={14} /> Confirm Password
                          </span>
                        </label>
                        <input
                          type="password"
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "1rem" }}
                        disabled={
                          isLoading ||
                          !email.includes("@") ||
                          !name.trim() ||
                          password.length < 6 ||
                          password !== confirmPassword
                        }
                      >
                        {isLoading ? (
                          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                            <Loader2 size={16} className="animate-spin" /> Creating Account…
                          </span>
                        ) : (
                          "Create Account"
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* BOTTOM SWITCHER LINK */}
          <div style={{ textAlign: "center", marginTop: "1.2rem", paddingTop: "0.8rem", borderTop: "1px solid var(--line)" }}>
            {authMode === "signin" ? (
              <button
                type="button"
                className="btn btn-quiet btn-sm"
                onClick={() => {
                  setAuthMode("signup");
                  setSignupStep(1);
                  setAuthError("");
                  setOtpSent(false);
                }}
                style={{ fontSize: "0.84rem" }}
              >
                New to Brief? <b>Create an account →</b>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-quiet btn-sm"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError("");
                  setOtpSent(false);
                }}
                style={{ fontSize: "0.84rem" }}
              >
                Already have an account? <b>Sign in →</b>
              </button>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<main className="animate-view-in"><div className="auth-wrap"><div className="auth-card glass-strong" /></div></main>}>
      <AuthPageInner />
    </Suspense>
  );
}
