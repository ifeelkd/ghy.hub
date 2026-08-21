"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  RoleType,
  Project,
  ClientProfile,
  UserApplication,
  ApplicantCandidate,
  VerificationItem,
  ReportItem,
  RatingAggregate,
  RecruiterRating,
  Profile,
} from "@/types";
import { createClient } from "@/lib/supabase/client";

export const LANGS = [
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "TypeScript",
  "Figma",
  "Adobe XD",
  "Photoshop",
  "Illustrator",
  "Premiere Pro",
  "DaVinci Resolve",
  "After Effects",
  "Lightroom",
  "WordPress",
  "Shopify",
  "Webflow",
  "Solidity",
  "Blender",
  "Canva",
  "Framer",
];

export const SKILLS = [
  "SEO",
  "Copywriting",
  "3D Modelling",
  "Drone Operation",
  "Color Grading",
  "API Integration",
  "E-commerce Setup",
  "Motion Graphics",
  "Illustration",
  "Branding",
  "Voice Acting",
  "Sound Design",
  "Animation",
  "UI Prototyping",
  "Email Marketing",
  "Studio Lighting",
];

export const CITIES = [
  "Remote",
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Kochi",
  "Chandigarh",
  "Indore",
  "Goa",
];

export const FORMATS = [
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Photography",
  "Videography",
  "Video Editing",
  "Content Writing",
  "Copywriting",
  "SEO & Marketing",
  "Voice Over",
  "3D & Motion Graphics",
  "WordPress / Shopify",
  "Web3 / Blockchain",
];

// Fallback seed data if database is fresh
const SEED_CLIENTS: Record<string, ClientProfile> = {
  brightloop: {
    id: "brightloop",
    org: "Brightloop Studio",
    person: "Aditya Mehra",
    verify: "Organisation verified",
    since: "2024",
    city: "Mumbai",
    ratings: [
      {
        by: "Nikhil A.",
        date: "Jun 2026",
        overall: 5,
        responded: true,
        described: true,
        paid: true,
        note: "Milestone payments cleared within a day each time, exactly as scoped.",
      },
      {
        by: "Priya S.",
        date: "Jun 2026",
        overall: 4,
        responded: true,
        described: true,
        paid: "na",
        note: "Scope was exactly as described. Wasn't selected.",
      },
    ],
  },
  pixelforge: {
    id: "pixelforge",
    org: "PixelForge Ads",
    person: "Naina Kapadia",
    verify: "Platform reviewed",
    since: "2023",
    city: "Mumbai",
    ratings: [
      {
        by: "Ritika J.",
        date: "Jul 2026",
        overall: 5,
        responded: true,
        described: true,
        paid: true,
        note: "Fastest payment I've had — invoice cleared the same week.",
      },
    ],
  },
};

const SEED_PROJECTS: Project[] = [
  {
    id: 0,
    rid: "brightloop",
    role: "Frontend Developer — React",
    project: "Bloom Grocery App Rebuild",
    format: "Web Development",
    city: "Remote",
    paid: "Paid",
    comp: "₹80,000 fixed, paid in 2 milestones",
    deadline: "9 Aug",
    window: "Sep–Oct 2026",
    langs: ["React", "Next.js"],
    age: "₹60,000–90,000",
    gender: "Any",
    mode: "Async, then video call",
    skills: ["API Integration"],
    desc: "Rebuild the checkout flow and product catalogue for a grocery delivery app. Clean component architecture over cleverness. Comfortable working from Figma files and shipping in two-week milestones.",
  },
  {
    id: 1,
    rid: "pixelforge",
    role: "Product photographer — festive campaign",
    project: "Diwali catalogue shoot",
    format: "Photography",
    city: "Mumbai",
    paid: "Paid",
    comp: "₹25,000/day + usage rights",
    deadline: "2 Aug",
    window: "12–13 Aug 2026",
    langs: [],
    age: "₹20,000–30,000/day",
    gender: "Any",
    mode: "In-person shoot",
    skills: ["Studio Lighting"],
    desc: "Two studio days shooting packaged food and gift hampers for a festive catalogue. Own lighting kit required. Prior e-commerce or catalogue work helpful.",
  },
];

export interface Session {
  role: RoleType;
  name: string;
  rid?: string | null;
  profile?: Profile;
}

interface ToastMessage {
  id: string;
  text: string;
}

interface MarketplaceContextType {
  session: Session | null;
  projects: Project[];
  clients: Record<string, ClientProfile>;
  myApps: UserApplication[];
  applicantLanes: Record<string, ApplicantCandidate[]>;
  verifQueue: VerificationItem[];
  reportsQueue: ReportItem[];
  toasts: ToastMessage[];
  isLoading: boolean;
  loginAsDemo: (role: RoleType) => void;
  signIn: (role: RoleType, name: string, rid?: string) => void;
  signOut: () => void;
  showToast: (text: string) => void;
  aggregateRatings: (rid: string) => RatingAggregate;
  hasApplied: (roleId: number) => boolean;
  submitApplication: (roleId: number, note?: string, sampleUrl?: string) => Promise<boolean>;
  submitRating: (roleId: number, rating: { overall: number; responded: boolean | 'na'; described: boolean | 'na'; paid: boolean | 'na'; note: string }) => Promise<boolean>;
  moveApplicant: (fromLane: string, index: number, toLane: string) => Promise<void>;
  postProject: (project: Omit<Project, "id">) => Promise<number>;
  adminAction: (index: number, queueType: "verif" | "reports", action: "approved" | "rejected" | "removed" | "dismissed") => Promise<void>;
  updateFreelancerProfile: (profile: Partial<Profile>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [clients, setClients] = useState<Record<string, ClientProfile>>(SEED_CLIENTS);
  const [myApps, setMyApps] = useState<UserApplication[]>([]);
  const [applicantLanes, setApplicantLanes] = useState<Record<string, ApplicantCandidate[]>>({
    new: [],
    short: [],
    maybe: [],
    rej: [],
  });
  const [verifQueue, setVerifQueue] = useState<VerificationItem[]>([]);
  const [reportsQueue, setReportsQueue] = useState<ReportItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const showToast = useCallback((text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  // Fetch live Supabase data on mount
  const refreshData = useCallback(async () => {
    const supabase = createClient();
    if (supabase) {
      try {
        // 1. Fetch live projects from Supabase
        const { data: dbProjects, error: projErr } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (!projErr && dbProjects && dbProjects.length > 0) {
          const mappedProjects: Project[] = dbProjects.map((p) => ({
            id: p.id,
            rid: p.client_id || "brightloop",
            role: p.role_title,
            project: p.title,
            format: p.category,
            city: p.city,
            paid: p.compensation_type === "Unpaid" ? "Unpaid" : p.compensation_type === "Hourly" ? "Hourly" : "Paid",
            comp: p.compensation_details,
            deadline: p.deadline,
            window: p.is_flexible_dates ? "Dates not locked" : `${p.start_date || ""}–${p.end_date || ""}`,
            langs: p.required_tools || [],
            age: `₹${p.budget_min?.toLocaleString("en-IN") || 0}–${p.budget_max?.toLocaleString("en-IN") || 0}`,
            gender: p.experience_required || "Any",
            mode: p.interview_mode || "Async",
            skills: p.additional_skills || [],
            desc: p.description,
            status: p.status,
          }));
          setProjects(mappedProjects);
        }

        // 2. Fetch live profiles from Supabase
        const { data: dbProfiles } = await supabase.from("profiles").select("*");
        if (dbProfiles && dbProfiles.length > 0) {
          const clientMap: Record<string, ClientProfile> = { ...SEED_CLIENTS };
          dbProfiles.forEach((p) => {
            if (p.role === "client" || p.role === "indie") {
              clientMap[p.id] = {
                id: p.id,
                org: p.org || p.name,
                person: p.person || p.name,
                verify: p.verified_tier || "Identity verified",
                since: p.verified_since || "2026",
                city: p.city || "Mumbai",
                ratings: [],
              };
            }
          });
          setClients(clientMap);
        }

        // 3. Fetch ratings
        const { data: dbRatings } = await supabase.from("ratings").select("*");
        if (dbRatings && dbRatings.length > 0) {
          setClients((prevClients) => {
            const updated = { ...prevClients };
            dbRatings.forEach((r) => {
              const client = updated[r.client_id];
              if (client) {
                const ratingObj: RecruiterRating = {
                  by: "Verified Freelancer",
                  date: new Date(r.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
                  overall: r.overall,
                  responded: r.responded === "true" ? true : r.responded === "false" ? false : "na",
                  described: r.described === "true" ? true : r.described === "false" ? false : "na",
                  paid: r.paid === "true" ? true : r.paid === "false" ? false : "na",
                  note: r.note || "",
                };
                client.ratings = [ratingObj, ...client.ratings.filter((x) => x.note !== r.note)];
              }
            });
            return updated;
          });
        }
      } catch (e) {
        console.warn("Supabase fetch error, maintaining state:", e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("brief_session");
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }
      const savedProjects = localStorage.getItem("brief_projects");
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }
      const savedMyApps = localStorage.getItem("brief_myapps");
      if (savedMyApps) {
        setMyApps(JSON.parse(savedMyApps));
      }
    } catch (e) {}
    refreshData();
  }, [refreshData]);

  const loginAsDemo = (role: RoleType) => {
    const names: Record<RoleType, { name: string; rid?: string }> = {
      freelancer: { name: "Keerti Sharma" },
      client: { name: "Aditya Mehra", rid: "brightloop" },
      indie: { name: "Rhea Kapoor", rid: "indie" },
      admin: { name: "Admin Desk" },
    };
    const user = names[role];
    signIn(role, user.name, user.rid);
  };

  const signIn = (role: RoleType, name: string, rid?: string) => {
    const newSession: Session = {
      role,
      name,
      rid: rid || (role === "client" ? "brightloop" : role === "indie" ? "indie" : null),
    };
    setSession(newSession);
    try {
      localStorage.setItem("brief_session", JSON.stringify(newSession));
    } catch (e) {}
    showToast(`Signed in as ${name}.`);
  };

  const signOut = () => {
    setSession(null);
    try {
      localStorage.removeItem("brief_session");
    } catch (e) {}
    showToast("Signed out.");
  };

  const aggregateRatings = (rid: string): RatingAggregate => {
    const r = clients[rid];
    if (!r || !r.ratings || !r.ratings.length) {
      return { n: 0, avg: "0.0", responded: null, described: null, paid: null, respN: 0, descN: 0, paidN: 0 };
    }
    const list = r.ratings;
    const n = list.length;
    let sum = 0;
    const resp = [0, 0];
    const desc = [0, 0];
    const paid = [0, 0];

    for (let i = 0; i < n; i++) {
      const x = list[i];
      sum += x.overall;
      if (x.responded !== "na") {
        resp[1]++;
        if (x.responded === true) resp[0]++;
      }
      if (x.described !== "na") {
        desc[1]++;
        if (x.described === true) desc[0]++;
      }
      if (x.paid !== "na") {
        paid[1]++;
        if (x.paid === true) paid[0]++;
      }
    }

    const pc = (a: number[]) => (a[1] ? Math.round((a[0] / a[1]) * 100) : null);

    return {
      n,
      avg: (sum / n).toFixed(1),
      responded: pc(resp),
      described: pc(desc),
      paid: pc(paid),
      respN: resp[1],
      descN: desc[1],
      paidN: paid[1],
    };
  };

  const hasApplied = (roleId: number) => {
    return myApps.some((a) => a.roleId === roleId);
  };

  const submitApplication = async (roleId: number, note?: string, sampleUrl?: string): Promise<boolean> => {
    if (hasApplied(roleId)) {
      showToast("Already applied to this project.");
      return false;
    }

    const newApp: UserApplication = {
      roleId,
      status: "New",
      applied: "Today",
      rated: false,
      note,
      sampleUrl,
    };
    const updated = [newApp, ...myApps];
    setMyApps(updated);
    try {
      localStorage.setItem("brief_myapps", JSON.stringify(updated));
    } catch (e) {}

    // Add candidate to applicant lanes
    const candidate: ApplicantCandidate = {
      n: session?.name || "Verified Freelancer",
      c: "Mumbai · Verified Profile",
      note: note || "Experienced specialist. Portfolio attached.",
      sampleUrl,
    };
    setApplicantLanes((prev) => ({
      ...prev,
      new: [candidate, ...prev.new],
    }));

    // Send to Supabase if connected
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("applications").insert({
          project_id: roleId,
          note,
          work_sample_url: sampleUrl,
          status: "new",
        });
      } catch (err) {
        console.warn("Supabase application insert note:", err);
      }
    }

    showToast("Application submitted.");
    return true;
  };

  const submitRating = async (
    roleId: number,
    ratingData: { overall: number; responded: boolean | "na"; described: boolean | "na"; paid: boolean | "na"; note: string }
  ): Promise<boolean> => {
    const appIndex = myApps.findIndex((a) => a.roleId === roleId);
    if (appIndex < 0 || myApps[appIndex].rated) {
      showToast("Cannot rate this project.");
      return false;
    }
    const project = projects.find((p) => p.id === roleId);
    if (!project) return false;

    const newRating: RecruiterRating = {
      by: session?.name || "Freelancer",
      date: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
      overall: ratingData.overall,
      responded: ratingData.responded,
      described: ratingData.described,
      paid: ratingData.paid,
      note: ratingData.note,
    };

    const updatedClients = { ...clients };
    if (updatedClients[project.rid]) {
      updatedClients[project.rid] = {
        ...updatedClients[project.rid],
        ratings: [newRating, ...updatedClients[project.rid].ratings],
      };
      setClients(updatedClients);
      try {
        localStorage.setItem("brief_clients", JSON.stringify(updatedClients));
      } catch (e) {}
    }

    const updatedApps = [...myApps];
    updatedApps[appIndex].rated = true;
    setMyApps(updatedApps);
    try {
      localStorage.setItem("brief_myapps", JSON.stringify(updatedApps));
    } catch (e) {}

    // Send to Supabase
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("ratings").insert({
          project_id: roleId,
          client_id: project.rid,
          overall: ratingData.overall,
          responded: String(ratingData.responded),
          described: String(ratingData.described),
          paid: String(ratingData.paid),
          note: ratingData.note,
        });
      } catch (err) {
        console.warn("Supabase rating insert note:", err);
      }
    }

    showToast("Rating submitted.");
    return true;
  };

  const moveApplicant = async (fromLane: string, index: number, toLane: string) => {
    const fromList = [...(applicantLanes[fromLane] || [])];
    const toList = [...(applicantLanes[toLane] || [])];
    const [item] = fromList.splice(index, 1);
    if (!item) return;
    toList.unshift(item);

    const laneNames: Record<string, string> = {
      new: "New",
      short: "Shortlisted",
      maybe: "Maybe",
      rej: "Rejected",
    };

    setApplicantLanes({
      ...applicantLanes,
      [fromLane]: fromList,
      [toLane]: toList,
    });

    showToast(`${item.n} → ${laneNames[toLane]}`);
  };

  const postProject = async (projectData: Omit<Project, "id">): Promise<number> => {
    let nextId = projects.length ? Math.max(...projects.map((p) => p.id)) + 1 : 0;

    const supabase = createClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("projects")
          .insert({
            title: projectData.project,
            role_title: projectData.role,
            category: projectData.format,
            city: projectData.city,
            description: projectData.desc,
            deadline: projectData.deadline,
            compensation_type: projectData.paid === "Unpaid" ? "Unpaid" : projectData.paid === "Hourly" ? "Hourly" : "Fixed price",
            compensation_details: projectData.comp,
            charges_freelancer_fee: false,
            required_tools: projectData.langs,
            additional_skills: projectData.skills,
            experience_required: projectData.gender,
            interview_mode: projectData.mode,
            status: "active",
          })
          .select("id")
          .single();

        if (!error && data?.id) {
          nextId = data.id;
        }
      } catch (err) {
        console.warn("Supabase project insert fallback:", err);
      }
    }

    const newProject: Project = {
      ...projectData,
      id: nextId,
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    try {
      localStorage.setItem("brief_projects", JSON.stringify(updated));
    } catch (e) {}
    showToast("Project published.");
    return nextId;
  };

  const adminAction = async (
    index: number,
    queueType: "verif" | "reports",
    action: "approved" | "rejected" | "removed" | "dismissed"
  ) => {
    if (queueType === "verif") {
      const updated = [...verifQueue];
      const [item] = updated.splice(index, 1);
      setVerifQueue(updated);
      showToast(`${item?.org || item?.who || "Item"} ${action}.`);
    } else {
      const updated = [...reportsQueue];
      const [item] = updated.splice(index, 1);
      setReportsQueue(updated);
      showToast(`Report ${action}.`);
    }
  };

  const updateFreelancerProfile = async (profileData: Partial<Profile>) => {
    if (!session) return;
    const updatedSession = {
      ...session,
      profile: {
        ...(session.profile || {
          id: "f-self",
          role: "freelancer",
          name: session.name,
          city: "Mumbai",
          rate_range: "₹1,000–2,500/hr",
          skills: [],
          tools: [],
          experience_level: "New freelancer",
          verified_tier: "Identity verified" as const,
          verified_since: "2026",
          created_at: new Date().toISOString(),
        }),
        ...profileData,
      },
    };
    setSession(updatedSession);
    try {
      localStorage.setItem("brief_session", JSON.stringify(updatedSession));
    } catch (e) {}

    // Send profile upsert to Supabase
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("profiles").upsert({
          name: profileData.name || session.name,
          city: profileData.city || "Mumbai",
          rate_range: profileData.rate_range || "₹1,000–2,500/hr",
          tagline: profileData.tagline,
          portfolio_url: profileData.portfolio_url,
          tools: profileData.tools,
          skills: profileData.skills,
          experience_level: profileData.experience_level,
          role: "freelancer",
        });
      } catch (err) {
        console.warn("Supabase profile upsert note:", err);
      }
    }

    showToast("Profile saved & synchronized.");
  };

  return (
    <MarketplaceContext.Provider
      value={{
        session,
        projects,
        clients,
        myApps,
        applicantLanes,
        verifQueue,
        reportsQueue,
        toasts,
        isLoading,
        loginAsDemo,
        signIn,
        signOut,
        showToast,
        aggregateRatings,
        hasApplied,
        submitApplication,
        submitRating,
        moveApplicant,
        postProject,
        adminAction,
        updateFreelancerProfile,
        refreshData,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
}
