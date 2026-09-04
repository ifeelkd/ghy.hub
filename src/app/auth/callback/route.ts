import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]);
            });
          } catch {}
        },
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return await resolveRedirect(supabase, origin, next);
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as "email" | "signup" | "invite" | "recovery" | "email_change" | "sms" });
    if (!error) {
      return await resolveRedirect(supabase, origin, next);
    }
  }

  // Auth failed — redirect back to auth with error
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
}

async function resolveRedirect(
  supabase: ReturnType<typeof createServerClient>,
  origin: string,
  fallback: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/auth?error=no_user`);
  }

  // Check if user has a profile (returning vs new)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profile) {
    // Existing user — route by role
    const role = profile.role as string;
    if (role === "freelancer") {
      return NextResponse.redirect(`${origin}/explore`);
    } else if (role === "admin") {
      return NextResponse.redirect(`${origin}/admin`);
    } else {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  } else {
    // New user — must go through onboarding
    return NextResponse.redirect(`${origin}/onboarding`);
  }
}
