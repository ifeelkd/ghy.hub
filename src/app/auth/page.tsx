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
    n: "Independent / Parent",
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

function AuthPageInner() {
  const { signIn, showToast } = useMarketplace();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [authMethod, setAuthMethod] = useState<"magic" | "password">("magic");

  // Credentials
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State flags
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Show error from callback redirect
  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "auth_failed") setAuthError("Authentication failed. Please try again.");
    if (err === "no_user") setAuthError("Could not verify your identity. Please try again.");
  }, [searchParams]);

  const routeUser = async (supabase: ReturnType<typeof createClient>) => {
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAuthError("Could not load user. Please try again.");
      return;
    }

    // Check if this user already has a profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, name")
      .eq("id", user.id)
      .single();

    if (profile) {
      // Existing / returning user
      const role = (profile.role as RoleType) || "freelancer";
      const userName = (profile.name as string) || user.email || "Member";
      signIn(role, userName);
      showToast(`Welcome back, ${userName}! 👋`);
      if (role === "admin") router.push("/admin");
      else if (role === "freelancer") router.push("/explore");
      else router.push("/dashboard");
    } else {
      // Brand new user — must complete onboarding
      const userRole = selectedRole || (user.user_metadata?.role as RoleType) || "freelancer";
      const userName = name.trim() || user.user_metadata?.name || user.email || "Member";
      signIn(userRole, userName);
      showToast("Account created! Let's set up your profile. 🎉");
      router.push("/onboarding");
    }
  };

  // ── MAGIC LINK ──────────────────────────────────────────
  const handleSendMagicLink = async () => {
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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
          data: {
            name: name.trim() || "User",
            role: selectedRole || "freelancer",
          },
        },
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setMagicLinkSent(true);
        showToast("Magic link sent! Check your inbox.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send link.";
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── PASSWORD AUTH ────────────────────────────────────────
  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setAuthError("Email and password are required.");
      return;
    }
    if (isSignUp) {
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
      if (isSignUp) {
        // ── SIGN UP ──
        if (!name.trim()) {
          setAuthError("Please enter your full name.");
          setIsLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
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
            setIsSignUp(false);
          } else {
            setAuthError(error.message);
          }
        } else {
          // Supabase sends a confirmation email; try to sign in directly too
          // (works when email confirm is disabled in project settings)
          const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });
          if (!loginErr && loginData.session) {
            await routeUser(supabase);
          } else {
            // Email confirmation required
            setMagicLinkSent(true);
            showToast("Check your email to confirm your account.");
          }
        }
      } else {
        // ── SIGN IN ──
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          if (
            error.message.toLowerCase().includes("invalid login credentials") ||
            error.message.toLowerCase().includes("invalid credentials")
          ) {
            // Check if user exists at all
            // We try signInWithOtp with shouldCreateUser:false to detect
            const checkRes = await supabase.auth.signInWithOtp({
              email: email.trim().toLowerCase(),
              options: { shouldCreateUser: false },
            });
            if (checkRes.error?.message?.toLowerCase().includes("signups not allowed")) {
              // User does NOT exist → prompt sign up
              setIsSignUp(true);
              setAuthError("No account found for this email. Fill in your details to create one.");
            } else {
              setAuthError("Incorrect password. Please try again or use a magic link.");
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
          {/* STEP 1: ROLE SELECTION */}
          {step === 1 && (
            <div className="fstep on">
              <span className="eyebrow">Welcome to Brief</span>
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
                onClick={() => setStep(2)}
              >
                Continue as{" "}
                {selectedRole
                  ? ROLE_OPTIONS.find((r) => r.k === selectedRole)?.n
                  : "…"}
              </button>
            </div>
          )}

          {/* STEP 2: CREDENTIALS */}
          {step === 2 && (
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
                    setStep(1);
                    setAuthError("");
                    setMagicLinkSent(false);
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
                {isSignUp ? "Create Account" : "Sign In"}
              </h1>
              <p className="hint">
                {isSignUp
                  ? "New to Brief? Set up your account below."
                  : "Welcome back. Enter your credentials to continue."}
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
                {(
                  [
                    { id: "magic" as const, label: "✉ Magic Link" },
                    { id: "password" as const, label: "🔒 Password" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setAuthMethod(m.id);
                      setAuthError("");
                      setMagicLinkSent(false);
                    }}
                    style={{
                      flex: 1,
                      padding: "0.5rem 0.8rem",
                      border: "none",
                      borderRadius: "6px",
                      background: authMethod === m.id ? "#fff" : "transparent",
                      color: authMethod === m.id ? "var(--ink)" : "var(--muted)",
                      fontWeight: authMethod === m.id ? 700 : 500,
                      cursor: "pointer",
                      boxShadow:
                        authMethod === m.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                      fontSize: "0.85rem",
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {authError && (
                <div
                  style={{
                    padding: "0.6rem 0.8rem",
                    borderRadius: "var(--r-sm)",
                    background: "rgba(220,38,38,0.08)",
                    color: "#dc2626",
                    fontSize: "0.85rem",
                    marginBottom: "1rem",
                    border: "1px solid rgba(220,38,38,0.2)",
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "flex-start",
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
                  {authError}
                </div>
              )}

              {/* ── MAGIC LINK FLOW ── */}
              {authMethod === "magic" && (
                <div>
                  {magicLinkSent ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem 1rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.8rem",
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          background: "rgba(22,163,74,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CheckCircle2 size={28} color="#16a34a" />
                      </div>
                      <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Check your inbox</h2>
                      <p className="hint" style={{ margin: 0, maxWidth: "280px" }}>
                        We sent a sign-in link to <b>{email}</b>. Click the link in
                        that email to continue — it opens this app automatically.
                      </p>
                      <p className="hint" style={{ fontSize: "0.8rem", margin: 0 }}>
                        Didn&apos;t get it? Check spam, or{" "}
                        <button
                          type="button"
                          className="btn btn-quiet btn-sm"
                          style={{ fontSize: "0.8rem", display: "inline", padding: 0 }}
                          onClick={() => {
                            setMagicLinkSent(false);
                            setAuthError("");
                          }}
                        >
                          try again
                        </button>
                        .
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="field">
                        <label>
                          <span
                            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                          >
                            <User size={14} /> Full name (for new accounts)
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
                          <span
                            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                          >
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
                        disabled={isLoading || !email.includes("@")}
                        onClick={handleSendMagicLink}
                      >
                        {isLoading ? (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <Loader2 size={16} className="animate-spin" /> Sending link…
                          </span>
                        ) : (
                          <>
                            <Link2 size={15} style={{ marginRight: "0.4rem" }} />
                            Send Magic Link
                          </>
                        )}
                      </button>

                      <p className="auth-note">
                        A secure sign-in link will be emailed to you. No password needed.
                        Works for both new &amp; existing accounts.
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* ── PASSWORD FLOW ── */}
              {authMethod === "password" && (
                <form onSubmit={handlePasswordAuth}>
                  {isSignUp && (
                    <div className="field">
                      <label>
                        <span
                          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                        >
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
                      <span
                        style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                      >
                        <Mail size={14} /> Email address
                      </span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Reset sign-up hint when email changes
                        if (isSignUp) setIsSignUp(false);
                        setAuthError("");
                      }}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>
                      <span
                        style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                      >
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

                  {isSignUp && (
                    <div className="field">
                      <label>
                        <span
                          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                        >
                          <Lock size={14} /> Confirm Password
                        </span>
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: "1rem" }}
                    disabled={isLoading || !email.includes("@") || password.length < 6}
                  >
                    {isLoading ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Loader2 size={16} className="animate-spin" /> Authenticating…
                      </span>
                    ) : isSignUp ? (
                      "Create Account"
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div style={{ textAlign: "center", marginTop: "0.8rem" }}>
                    <button
                      type="button"
                      className="btn btn-quiet btn-sm"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setAuthError("");
                        setConfirmPassword("");
                      }}
                      style={{ fontSize: "0.82rem" }}
                    >
                      {isSignUp
                        ? "Already have an account? Sign in"
                        : "New here? Create an account"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
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
