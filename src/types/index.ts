export type RoleType = 'freelancer' | 'client' | 'indie' | 'admin';

export type VerifiedTier = 'Unverified' | 'Identity verified' | 'Organisation verified' | 'Platform reviewed';

export type ApplicationStatus = 'new' | 'shortlisted' | 'maybe' | 'rejected' | 'closed';

export type CompensationType = 'Fixed price' | 'Hourly' | 'Unpaid';

export interface Profile {
  id: string;
  role: RoleType;
  name: string;
  phone?: string;
  org?: string;
  person?: string;
  city: string;
  rate_range: string;
  tagline?: string;
  portfolio_url?: string;
  portfolio_items?: string[];
  skills: string[];
  tools: string[];
  experience_level: string;
  available_from?: string;
  verified_tier: VerifiedTier;
  verified_since: string;
  created_at: string;
}

export interface RecruiterRating {
  by: string;
  date: string;
  overall: number;
  responded: boolean | 'na';
  described: boolean | 'na';
  paid: boolean | 'na';
  note: string;
}

export interface ClientProfile {
  id: string;
  org: string;
  person: string;
  verify: VerifiedTier;
  since: string;
  city: string;
  ratings: RecruiterRating[];
}

export interface Project {
  id: number;
  rid: string; // client id (e.g. 'brightloop', 'pixelforge')
  role: string; // e.g. 'Frontend Developer — React'
  project: string; // e.g. 'Bloom Grocery App Rebuild'
  format: string; // category, e.g. 'Web Development'
  city: string; // e.g. 'Remote', 'Mumbai'
  paid: 'Paid' | 'Unpaid' | 'Hourly';
  comp: string; // e.g. '₹80,000 fixed, paid in 2 milestones'
  deadline: string; // e.g. '9 Aug'
  window: string; // timeline, e.g. 'Sep–Oct 2026'
  langs: string[]; // tools e.g. ['React', 'Next.js']
  age: string; // budget range e.g. '₹60,000–90,000'
  gender: string; // experience level e.g. 'Junior', 'Senior', 'Any'
  mode: string; // e.g. 'Async, then video call'
  skills: string[]; // additional skills e.g. ['API Integration']
  desc: string;
  charges_fee?: boolean;
  status?: 'active' | 'closed' | 'removed';
}

export interface UserApplication {
  id?: string;
  roleId: number;
  freelancerName?: string;
  freelancerCityExp?: string;
  status: 'New' | 'Shortlisted' | 'Maybe' | 'Rejected' | 'Closed';
  applied: string;
  rated: boolean;
  note?: string;
  sampleUrl?: string;
}

export interface ApplicantCandidate {
  n: string;
  c: string;
  note: string;
  sampleUrl?: string;
}

export interface VerificationItem {
  id: string;
  who: string;
  org: string;
  docs: string;
  when: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ReportItem {
  id: string;
  what: string;
  why: string;
  by: string;
  sev: 'low' | 'medium' | 'high';
  status?: 'open' | 'resolved' | 'dismissed';
}

export interface RatingAggregate {
  n: number;
  avg: string;
  responded: number | null;
  described: number | null;
  paid: number | null;
  respN: number;
  descN: number;
  paidN: number;
}
