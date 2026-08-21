"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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

const INITIAL_CLIENTS: Record<string, ClientProfile> = {
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
      {
        by: "Devansh R.",
        date: "May 2026",
        overall: 5,
        responded: true,
        described: true,
        paid: true,
        note: "",
      },
      {
        by: "Anjali T.",
        date: "May 2026",
        overall: 4,
        responded: true,
        described: false,
        paid: "na",
        note: "Kickoff call ran two hours late, otherwise fine.",
      },
      {
        by: "Karan M.",
        date: "Apr 2026",
        overall: 5,
        responded: true,
        described: true,
        paid: true,
        note: "",
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
      {
        by: "Aman K.",
        date: "Jun 2026",
        overall: 4,
        responded: true,
        described: true,
        paid: true,
        note: "",
      },
      {
        by: "Sneha P.",
        date: "Jun 2026",
        overall: 5,
        responded: true,
        described: true,
        paid: true,
        note: "",
      },
    ],
  },
  nimbus: {
    id: "nimbus",
    org: "Nimbus Health",
    person: "Karthik Iyer",
    verify: "Organisation verified",
    since: "2025",
    city: "Hyderabad",
    ratings: [
      {
        by: "Vikram N.",
        date: "Jun 2026",
        overall: 3,
        responded: false,
        described: "na",
        paid: "na",
        note: "No response after submission. Role filled without notice.",
      },
      {
        by: "Lakshmi V.",
        date: "May 2026",
        overall: 4,
        responded: true,
        described: true,
        paid: true,
        note: "",
      },
      {
        by: "Tarun S.",
        date: "May 2026",
        overall: 2,
        responded: false,
        described: "na",
        paid: "na",
        note: "Applied twice, never heard back either time.",
      },
    ],
  },
  indie: {
    id: "indie",
    org: "Independent — Rhea Kapoor",
    person: "Rhea Kapoor",
    verify: "Identity verified",
    since: "2026",
    city: "Delhi NCR",
    ratings: [],
  },
  soundwave: {
    id: "soundwave",
    org: "Soundwave Media",
    person: "Farhan Sheikh",
    verify: "Identity verified",
    since: "2025",
    city: "Remote",
    ratings: [
      {
        by: "Ishita B.",
        date: "Jun 2026",
        overall: 5,
        responded: true,
        described: true,
        paid: true,
        note: "Clear direction, paid per episode as agreed.",
      },
    ],
  },
  founders: {
    id: "founders",
    org: "Founders Circle",
    person: "Aditi Kulkarni",
    verify: "Organisation verified",
    since: "2022",
    city: "Mumbai",
    ratings: [
      {
        by: "Rohan D.",
        date: "Apr 2026",
        overall: 5,
        responded: true,
        described: true,
        paid: true,
        note: "Hourly invoices paid in full at the end of each week.",
      },
      {
        by: "Mehak S.",
        date: "Mar 2026",
        overall: 4,
        responded: true,
        described: true,
        paid: true,
        note: "",
      },
    ],
  },
};

const INITIAL_PROJECTS: Project[] = [
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
  {
    id: 2,
    rid: "nimbus",
    role: "UI/UX Designer — patient app",
    project: "Nimbus Health App v2",
    format: "UI/UX Design",
    city: "Hyderabad",
    paid: "Paid",
    comp: "As per scoped rate card",
    deadline: "16 Aug",
    window: "Oct–Dec 2026",
    langs: ["Figma"],
    age: "₹50,000–70,000",
    gender: "Senior",
    mode: "Async, then video call",
    skills: [],
    desc: "Redesign the appointment booking and reports flow for a patient-facing health app. Needs healthcare or fintech UX experience and comfort presenting to a clinical stakeholder group across a 10-week engagement.",
  },
  {
    id: 3,
    rid: "indie",
    role: "Website for a local NGO",
    project: "GreenRoots Foundation site",
    format: "Web Development",
    city: "Delhi NCR",
    paid: "Unpaid",
    comp: "Unpaid · portfolio credit and testimonial",
    deadline: "6 Aug",
    window: "Last two weekends of Aug",
    langs: ["WordPress"],
    age: "—",
    gender: "Any",
    mode: "In person, Delhi NCR",
    skills: [],
    desc: "A five-page site for a small environmental NGO. Honest, functional work — good for a portfolio case study. Content and photos provided.",
  },
  {
    id: 4,
    rid: "soundwave",
    role: "Voice-over artist — podcast intro",
    project: "Soundwave Weekly",
    format: "Voice Over",
    city: "Remote",
    paid: "Paid",
    comp: "₹5,000 per episode",
    deadline: "20 Aug",
    window: "Remote, flexible",
    langs: [],
    age: "₹5,000/ep",
    gender: "Any",
    mode: "Remote / audio submission",
    skills: ["Voice Acting"],
    desc: "A dry, unhurried narrator voice for a 6-part weekly tech podcast intro. Home-studio quality acceptable. Direction over voice notes and calls.",
  },
  {
    id: 5,
    rid: "founders",
    role: "Content writers — 4 positions",
    project: "Founders Circle blog",
    format: "Content Writing",
    city: "Mumbai",
    paid: "Hourly",
    comp: "₹800/hr, 10 hrs/week minimum",
    deadline: "11 Aug",
    window: "Ongoing from Sep",
    langs: [],
    age: "₹800/hr",
    gender: "Any",
    mode: "Async",
    skills: ["SEO"],
    desc: "Four ongoing writer slots for a startup blog covering fundraising, hiring and product. SEO awareness a plus. Six-week trial period, evenings or weekends fine.",
  },
];

const INITIAL_MYAPPS: UserApplication[] = [
  { roleId: 0, status: "New", applied: "18 Jul", rated: false },
  { roleId: 1, status: "Shortlisted", applied: "12 Jul", rated: false },
  { roleId: 5, status: "Closed", applied: "2 Jul", rated: false },
  { roleId: 2, status: "Closed", applied: "24 Jun", rated: false },
];

const INITIAL_APPLICANT_LANES: Record<string, ApplicantCandidate[]> = {
  new: [
    {
      n: "Kabir Menon",
      c: "Mumbai · 4 yrs",
      note: "Shipped three React storefronts, comfortable with Next.js App Router and Stripe.",
    },
    {
      n: "Arjun Pawar",
      c: "Pune · 2 yrs",
      note: "E-commerce background, strong on performance and accessibility.",
    },
    {
      n: "Sameer D.",
      c: "Nashik · 5 yrs",
      note: "Built a grocery delivery MVP solo end to end. Case study attached.",
    },
  ],
  short: [
    {
      n: "Vihaan Rao",
      c: "Mumbai · 3 yrs",
      note: "Cleanest checkout demo of the batch — handled edge cases well.",
    },
  ],
  maybe: [
    {
      n: "Ishaan K.",
      c: "Thane · 1 yr",
      note: "Solid fundamentals, portfolio still thin on production apps.",
    },
  ],
  rej: [
    {
      n: "Rohit S.",
      c: "Mumbai · 8 yrs",
      note: "Rate expectations well above the posted budget.",
    },
  ],
};

const INITIAL_VERIF_QUEUE: VerificationItem[] = [
  {
    id: "v1",
    who: "Rhea Kapoor",
    org: "Independent client",
    docs: "Aadhaar + LinkedIn profile",
    when: "2 hours ago",
    status: "pending",
  },
  {
    id: "v2",
    who: "Naina Kapadia",
    org: "PixelForge Ads",
    docs: "GST certificate + work email",
    when: "Yesterday",
    status: "pending",
  },
  {
    id: "v3",
    who: "Neha Bhatt",
    org: "Bhatt Design Co.",
    docs: "PAN + company website",
    when: "2 days ago",
    status: "pending",
  },
];

const INITIAL_REPORTS_QUEUE: ReportItem[] = [
  {
    id: "r1",
    what: "Listing — 'Junior dev needed, ₹500 to view brief'",
    why: "Charges freelancers a fee",
    by: "4 freelancers",
    sev: "high",
    status: "open",
  },
  {
    id: "r2",
    what: "User — @quickhire_mum",
    why: "Requesting free spec work over WhatsApp",
    by: "2 freelancers",
    sev: "high",
    status: "open",
  },
  {
    id: "r3",
    what: "Listing — 'Urgent logo, Andheri'",
    why: "No compensation stated",
    by: "1 freelancer",
    sev: "low",
    status: "open",
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
  loginAsDemo: (role: RoleType) => void;
  signIn: (role: RoleType, name: string, rid?: string) => void;
  signOut: () => void;
  showToast: (text: string) => void;
  aggregateRatings: (rid: string) => RatingAggregate;
  hasApplied: (roleId: number) => boolean;
  submitApplication: (roleId: number, note?: string, sampleUrl?: string) => boolean;
  submitRating: (roleId: number, rating: { overall: number; responded: boolean | 'na'; described: boolean | 'na'; paid: boolean | 'na'; note: string }) => boolean;
  moveApplicant: (fromLane: string, index: number, toLane: string) => void;
  postProject: (project: Omit<Project, "id">) => number;
  adminAction: (index: number, queueType: "verif" | "reports", action: "approved" | "rejected" | "removed" | "dismissed") => void;
  updateFreelancerProfile: (profile: Partial<Profile>) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | null>(null);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [clients, setClients] = useState<Record<string, ClientProfile>>(INITIAL_CLIENTS);
  const [myApps, setMyApps] = useState<UserApplication[]>(INITIAL_MYAPPS);
  const [applicantLanes, setApplicantLanes] = useState<Record<string, ApplicantCandidate[]>>(INITIAL_APPLICANT_LANES);
  const [verifQueue, setVerifQueue] = useState<VerificationItem[]>(INITIAL_VERIF_QUEUE);
  const [reportsQueue, setReportsQueue] = useState<ReportItem[]>(INITIAL_REPORTS_QUEUE);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load from LocalStorage if available
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
      const savedClients = localStorage.getItem("brief_clients");
      if (savedClients) {
        setClients(JSON.parse(savedClients));
      }
    } catch (e) {
      console.error("Failed to load local storage state", e);
    }
  }, []);

  const showToast = (text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

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

  const submitApplication = (roleId: number, note?: string, sampleUrl?: string): boolean => {
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

    // Add candidate to applicant lanes for the project
    const candidate: ApplicantCandidate = {
      n: session?.name || "Keerti Sharma",
      c: "Mumbai · Verified Profile",
      note: note || "Experienced specialist. Portfolio attached.",
      sampleUrl,
    };
    setApplicantLanes((prev) => ({
      ...prev,
      new: [candidate, ...prev.new],
    }));

    showToast("Application submitted.");
    return true;
  };

  const submitRating = (
    roleId: number,
    ratingData: { overall: number; responded: boolean | "na"; described: boolean | "na"; paid: boolean | "na"; note: string }
  ): boolean => {
    const appIndex = myApps.findIndex((a) => a.roleId === roleId);
    if (appIndex < 0 || myApps[appIndex].rated) {
      showToast("Cannot rate this project.");
      return false;
    }
    const project = projects.find((p) => p.id === roleId);
    if (!project) return false;

    const newRating: RecruiterRating = {
      by: session?.name || "Freelancer",
      date: "Aug 2026",
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

    showToast("Rating submitted.");
    return true;
  };

  const moveApplicant = (fromLane: string, index: number, toLane: string) => {
    const fromList = [...applicantLanes[fromLane]];
    const toList = [...applicantLanes[toLane]];
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

  const postProject = (projectData: Omit<Project, "id">): number => {
    const nextId = projects.length ? Math.max(...projects.map((p) => p.id)) + 1 : 0;
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

  const adminAction = (
    index: number,
    queueType: "verif" | "reports",
    action: "approved" | "rejected" | "removed" | "dismissed"
  ) => {
    if (queueType === "verif") {
      const updated = [...verifQueue];
      const [item] = updated.splice(index, 1);
      setVerifQueue(updated);
      showToast(`${item.org || item.who} ${action}.`);
    } else {
      const updated = [...reportsQueue];
      const [item] = updated.splice(index, 1);
      setReportsQueue(updated);
      showToast(`Report ${action}.`);
    }
  };

  const updateFreelancerProfile = (profileData: Partial<Profile>) => {
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
    showToast("Profile updated.");
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
