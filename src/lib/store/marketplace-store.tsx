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
  // Web & Frontend
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Vue.js",
  "Nuxt.js",
  "Angular",
  "Svelte",
  "SvelteKit",
  "HTML5 & CSS3",
  "Tailwind CSS",
  "Bootstrap",
  "Sass / SCSS",
  "GraphQL",
  "Redux / Zustand",
  // Mobile Development
  "Flutter",
  "React Native",
  "Swift",
  "SwiftUI",
  "Kotlin",
  "Java (Android)",
  "Dart",
  "Expo",
  // Backend & APIs
  "Node.js",
  "Express.js",
  "NestJS",
  "Python",
  "Django",
  "FastAPI",
  "Flask",
  "Go (Golang)",
  "Rust",
  "Java (Spring Boot)",
  "C# / .NET",
  "C++",
  "PHP",
  "Laravel",
  "Ruby on Rails",
  "REST APIs",
  "gRPC",
  // Database & Cloud
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Supabase",
  "Firebase",
  "Docker",
  "Kubernetes",
  "AWS",
  "Google Cloud (GCP)",
  "Microsoft Azure",
  "Vercel",
  "Linux / Bash",
  "Git & GitHub",
  // AI, Data & Machine Learning
  "PyTorch",
  "TensorFlow",
  "Pandas / NumPy",
  "Scikit-learn",
  "Hugging Face",
  "OpenAI API / LLMs",
  "LangChain",
  "Computer Vision / OpenCV",
  "Data Analysis / SQL",
  "Tableau",
  "Power BI",
  // Design, 3D & Creative Tools
  "Figma",
  "Adobe XD",
  "Photoshop",
  "Illustrator",
  "InDesign",
  "Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Lightroom",
  "Blender",
  "Cinema 4D",
  "Maya",
  "Canva",
  "Framer",
  "Webflow",
  "WordPress",
  "Shopify",
  "Wix / Squarespace",
  "Solidity / Web3",
];

export const SKILLS = [
  // Engineering & Development
  "Frontend Development",
  "Full Stack Development",
  "Backend Engineering",
  "Mobile App Development",
  "API Integration",
  "Database Design",
  "DevOps & CI/CD",
  "Cloud Architecture",
  "Cybersecurity & Auditing",
  "Microservices",
  "Automated Testing & QA",
  "Code Review & Refactoring",
  "Performance Optimization",
  "Web Scraping & Automation",
  // AI & Data
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing (NLP)",
  "Generative AI & Prompt Engineering",
  "Data Engineering",
  "Data Visualization",
  "Predictive Modeling",
  "Statistical Analysis",
  // UI/UX & Design
  "UI/UX Design",
  "Wireframing & Prototyping",
  "Design Systems",
  "Brand Identity & Logo Design",
  "Graphic Design",
  "Illustration",
  "Icon Design",
  "Packaging Design",
  "Print & Editorial Design",
  // Video, 3D & Audio
  "Video Editing",
  "Motion Graphics",
  "3D Modelling & Texturing",
  "3D Animation",
  "Color Grading",
  "Videography",
  "Photography",
  "Studio Lighting",
  "Drone Videography",
  "Sound Design & Audio Engineering",
  "Voice Acting & Voiceover",
  "Podcast Production",
  // Content & Marketing
  "Technical Writing",
  "Copywriting",
  "Content Writing & Blogging",
  "SEO (Search Engine Optimization)",
  "Content Strategy",
  "Social Media Marketing",
  "Performance Marketing",
  "Google Ads & PPC",
  "Meta Ads (Facebook/Instagram)",
  "Email Marketing & Automation",
  "Ghostwriting",
  "Scriptwriting",
  "Community Management",
  "Public Relations",
  // Business & Project Management
  "Product Management",
  "Agile / Scrum Coaching",
  "Business Analysis",
  "Market Research",
  "Financial Modeling",
  "Pitch Deck Design",
  // Teaching & Academics
  "Curriculum & Syllabus Design",
  "Exam Preparation & Strategy",
  "Interactive Lesson Planning",
  "One-on-One Tutoring",
  "Doubt Clearing & Mentorship",
  "Homework Support",
  "Academic Counseling",
  "STEM Project Guidance",
];

export const CITIES = [
  // Worldwide / Remote
  "Remote (Worldwide)",
  // India - Metros & Major Tech/Academic Hubs
  "Bengaluru",
  "Delhi NCR",
  "Mumbai",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Kochi",
  "Lucknow",
  "Indore",
  "Goa",
  "Bhopal",
  "Nagpur",
  "Patna",
  "Surat",
  "Vadodara",
  "Visakhapatnam",
  "Coimbatore",
  "Bhubaneswar",
  "Guwahati",
  "Thiruvananthapuram",
  "Dehradun",
  "Varanasi",
  "Amritsar",
  "Ludhiana",
  "Ranchi",
  "Raipur",
  "Mysuru",
  // United States & Canada
  "New York, USA",
  "San Francisco Bay Area, USA",
  "Seattle, USA",
  "Austin, USA",
  "Los Angeles, USA",
  "Boston, USA",
  "Chicago, USA",
  "Atlanta, USA",
  "Denver, USA",
  "Toronto, Canada",
  "Vancouver, Canada",
  "Montreal, Canada",
  // United Kingdom & Europe
  "London, UK",
  "Manchester, UK",
  "Berlin, Germany",
  "Munich, Germany",
  "Amsterdam, Netherlands",
  "Paris, France",
  "Dublin, Ireland",
  "Stockholm, Sweden",
  "Zurich, Switzerland",
  "Barcelona, Spain",
  "Madrid, Spain",
  "Milan, Italy",
  "Vienna, Austria",
  "Warsaw, Poland",
  // Middle East & Africa
  "Dubai, UAE",
  "Abu Dhabi, UAE",
  "Doha, Qatar",
  "Riyadh, Saudi Arabia",
  "Tel Aviv, Israel",
  "Cape Town, South Africa",
  "Nairobi, Kenya",
  "Lagos, Nigeria",
  // Asia Pacific
  "Singapore",
  "Tokyo, Japan",
  "Seoul, South Korea",
  "Hong Kong",
  "Kuala Lumpur, Malaysia",
  "Bangkok, Thailand",
  "Jakarta, Indonesia",
  "Sydney, Australia",
  "Melbourne, Australia",
  "Brisbane, Australia",
  "Auckland, New Zealand",
  // Latin America
  "São Paulo, Brazil",
  "Mexico City, Mexico",
  "Buenos Aires, Argentina",
  "Bogotá, Colombia",
  "Santiago, Chile",
];

export const FORMATS = [
  "Teaching & Tutoring",
  "Academic Mentorship",
  "Test Prep Coaching",
  "Language Instruction",
  "Web Development",
  "Mobile App Development",
  "UI/UX Design",
  "Graphic Design",
  "Branding & Identity",
  "Video Editing",
  "Videography & Production",
  "Photography",
  "3D & Motion Graphics",
  "Content Writing & Copy",
  "Technical Writing",
  "SEO & Growth Marketing",
  "Social Media Management",
  "Voice Over & Audio",
  "AI & Machine Learning",
  "Cloud & DevOps Architecture",
  "WordPress & Shopify",
  "Web3 & Blockchain",
  "Consulting & Advisory",
];

export const TEACHING_SUBJECTS = [
  // STEM Subjects
  "Mathematics (Algebra, Geometry, Trigonometry)",
  "Advanced Mathematics & Calculus",
  "Applied Mathematics & Statistics",
  "Vedic Mathematics & Mental Math",
  "Physics (Mechanics, Electromagnetism, Modern)",
  "Chemistry (Physical, Organic, Inorganic)",
  "Biology (Botany, Zoology, Genetics)",
  "Biotechnology & Biochemistry",
  "Computer Science (Python, Java, C++)",
  "Web Development & Coding for Kids",
  "Data Science & Artificial Intelligence",
  "Robotics & Electronics",
  // Commerce & Business
  "Accountancy & Financial Accounting",
  "Business Studies & Management",
  "Economics (Micro & Macro)",
  "Cost & Management Accounting",
  // Humanities & Social Sciences
  "English Literature & Composition",
  "English Language, Grammar & Spoken English",
  "History & World Civilizations",
  "Geography & Environmental Studies",
  "Political Science & Civics",
  "Psychology",
  "Sociology",
  "Philosophy",
  // Global & Regional Languages
  "Hindi",
  "Sanskrit",
  "French",
  "German",
  "Spanish",
  "Mandarin Chinese",
  "Japanese",
  "Arabic",
  "Italian",
  "Russian",
  "Regional Languages (Bengali, Tamil, Telugu, Marathi, etc.)",
  // Competitive Exams & Test Prep
  "IIT-JEE (Main & Advanced) — Physics, Chemistry, Math",
  "NEET-UG — Physics, Chemistry, Biology",
  "SAT / ACT (US College Admissions)",
  "AP (Advanced Placement) Exam Prep",
  "IB Diploma Subject Coaching",
  "CUET (Common University Entrance Test)",
  "IELTS / TOEFL / PTE (English Proficiency)",
  "GRE / GMAT (Graduate Admissions)",
  "CAT / MBA Entrance Prep",
  "UPSC / Civil Services Foundation",
  "Olympiads (Math, Science, Cyber)",
  // Creative & Performing Arts
  "Vocal Music (Indian Classical / Western)",
  "Instrumental Music (Guitar, Piano, Keyboard, Violin, Drums)",
  "Fine Arts, Sketching & Oil/Acrylic Painting",
  "Digital Art & Graphic Design",
  "Chess Tactics & Mastery",
  "Yoga & Mindfulness",
];

export const EDUCATION_LEVELS = [
  "Early Childhood / Kindergarten",
  "Primary School (Grades 1–5)",
  "Middle School (Grades 6–8)",
  "Secondary (Grades 9–10)",
  "Senior Secondary (Grades 11–12)",
  "College / Undergraduate (B.Tech, B.Sc, B.Com, B.A.)",
  "Postgraduate & Masters (M.Tech, M.Sc, MBA)",
  "Competitive Exam Aspirants",
  "Adult Learners & Working Professionals",
];

export const EDUCATION_BOARDS = [
  "CBSE (Central Board of Secondary Education)",
  "ICSE / ISC (Council for the Indian School Certificate Examinations)",
  "State Board (State-Specific Curriculum)",
  "IB (International Baccalaureate — PYP, MYP, DP)",
  "Cambridge International (IGCSE, AS & A Levels)",
  "AP (College Board Advanced Placement)",
  "American High School Diploma / US Common Core",
  "UK National Curriculum / GCSE",
  "Canadian Provincial Curriculum",
  "Australian Curriculum (ATAR)",
  "University / Degree Curriculum",
  "General / Open Learning",
];

export const TEACHER_QUALIFICATIONS = [
  "B.Ed (Bachelor of Education)",
  "M.Ed (Master of Education)",
  "Ph.D. / Doctorate Scholar",
  "Postgraduate (M.Sc / M.A. / M.Com / M.Tech)",
  "Graduate (B.Sc / B.A. / B.Com / B.Tech)",
  "CTET / State TET Qualified",
  "IB / Cambridge Certified Educator",
  "IIT / NIT / Top Tier Alumni",
  "Professional Certified Tutor",
  "Industry Subject Specialist",
];

export const TEACHING_MODES = [
  "Online 1-on-1 (Personalized)",
  "Online Small Group (2–5 students)",
  "Online Batch / Classroom (6+ students)",
  "In-Person / Home Tutoring",
  "Hybrid (Online + In-Person Sessions)",
];

export const TEACHING_TOOLS = [
  "Zoom",
  "Google Meet",
  "Miro Interactive Whiteboard",
  "GeoGebra",
  "LaTeX / Overleaf",
  "Google Classroom",
  "Kahoot & Quizizz",
  "Khan Academy",
  "OneNote / Wacom Digital Pen",
  "Notion Workspace",
  "PhET Interactive Simulations",
  "Microsoft Teams",
  "Desmos Graphing Calculator",
];

export const LANGUAGES_OF_INSTRUCTION = [
  "English",
  "Hindi",
  "Bilingual (English + Hindi)",
  "Spanish",
  "French",
  "German",
  "Mandarin Chinese",
  "Arabic",
  "Bengali",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Gujarati",
  "Punjabi",
  "Urdu",
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Record<string, ClientProfile>>({});
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
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (!projErr) {
          if (dbProjects && dbProjects.length > 0) {
            const mappedProjects: Project[] = dbProjects.map((p) => ({
              id: p.id,
              rid: p.client_id || "client",
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
          } else {
            // Live database is empty
            setProjects([]);
          }
        }

        // 2. Fetch live profiles from Supabase
        const { data: dbProfiles } = await supabase.from("profiles").select("*");
        if (dbProfiles) {
          const clientMap: Record<string, ClientProfile> = {};
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
        console.warn("Supabase fetch error:", e);
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
    } catch (e) {}
    refreshData();
  }, [refreshData]);

  const loginAsDemo = (role: RoleType) => {
    const names: Record<RoleType, { name: string; rid?: string }> = {
      freelancer: { name: "Freelancer" },
      client: { name: "Client Account", rid: "client" },
      indie: { name: "Independent Client", rid: "indie" },
      admin: { name: "Admin Desk" },
    };
    const user = names[role];
    signIn(role, user.name, user.rid);
  };

  const signIn = (role: RoleType, name: string, rid?: string) => {
    const newSession: Session = {
      role,
      name,
      rid: rid || (role === "client" ? "client" : role === "indie" ? "indie" : null),
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
      localStorage.removeItem("brief_projects");
      localStorage.removeItem("brief_myapps");
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
      n: session?.name || "Applicant",
      c: "Verified Profile",
      note: note || "Application submitted.",
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
    let nextId = projects.length ? Math.max(...projects.map((p) => p.id)) + 1 : 1;

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
        console.warn("Supabase project insert:", err);
      }
    }

    const newProject: Project = {
      ...projectData,
      id: nextId,
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
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
        const payload: Record<string, unknown> = {
          name: profileData.name || session.name,
          city: profileData.city || "Mumbai",
          rate_range: profileData.rate_range || "₹1,000–2,500/hr",
          tagline: profileData.tagline,
          portfolio_url: profileData.portfolio_url,
          tools: profileData.tools || [],
          skills: profileData.skills || [],
          experience_level: profileData.experience_level,
          role: "freelancer",
        };

        if (profileData.is_teacher) {
          payload.is_teacher = true;
          payload.subjects = profileData.subjects || [];
          payload.grades = profileData.grades || [];
          payload.boards = profileData.boards || [];
          payload.qualification = profileData.qualification || "";
          payload.teaching_mode = profileData.teaching_mode || "Online 1-on-1";
          payload.languages_spoken = profileData.languages_spoken || [];
          payload.demo_video_url = profileData.demo_video_url || "";
        }

        const { error: upsertErr } = await supabase.from("profiles").upsert(payload);
        if (upsertErr) {
          // If custom teacher columns aren't in schema yet, fallback to base payload
          console.warn("Supabase upsert warning, retrying with base fields:", upsertErr);
          await supabase.from("profiles").upsert({
            name: profileData.name || session.name,
            city: profileData.city || "Mumbai",
            rate_range: profileData.rate_range || "₹1,000–2,500/hr",
            tagline: profileData.tagline,
            portfolio_url: profileData.portfolio_url,
            tools: profileData.tools || [],
            skills: profileData.skills || [],
            experience_level: profileData.experience_level,
            role: "freelancer",
          });
        }
      } catch (err) {
        console.warn("Supabase profile upsert error:", err);
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
