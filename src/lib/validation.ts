import { z } from "zod";

// Freelancer Profile Schema
export const FreelancerProfileSchema = z.object({
  name: z.string().trim().min(2, "Display name must be at least 2 characters"),
  city: z.string().trim().min(1, "Base city is required"),
  rate_range: z.string().default("₹1,000–2,500/hr"),
  freelancing_since: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    return !isNaN(date.getTime()) && date <= new Date();
  }, { message: "Date cannot be in the future" }),
  tagline: z.string().trim().max(160, "Tagline must be under 160 characters").optional(),
  portfolio_url: z.string().trim().url("Must be a valid URL (e.g. https://behance.net/...)").or(z.literal("")).optional(),
  portfolio_items_count: z.number().min(2, "Please add at least two portfolio pieces"),
  tools: z.array(z.string()).min(1, "Select at least one skill or tool"),
  skills: z.array(z.string()).default([]),
  experience_level: z.enum(["New freelancer", "1–10 projects", "Established"]).default("New freelancer"),
  available_from: z.string().optional(),
});

// Client Project Creation Schema (With Zero-Fee Guardrail)
export const PostProjectSchema = z.object({
  title: z.string().trim().min(3, "Project title must be at least 3 characters"),
  category: z.string().min(1, "Select a category"),
  city: z.string().min(1, "Select a city or Remote"),
  role_title: z.string().trim().min(3, "Position title must be at least 3 characters"),
  description: z.string().trim().min(20, "Describe the project — at least 20 characters"),
  budget_min: z.number().nonnegative("Minimum budget must be 0 or higher"),
  budget_max: z.number().nonnegative("Maximum budget must be 0 or higher"),
  experience_required: z.enum(["Any", "Junior", "Senior"]).default("Any"),
  required_tools: z.array(z.string()).min(1, "Select at least one required skill or tool"),
  additional_skills: z.array(z.string()).default([]),
  deadline: z.string().min(1, "Set the applications closing date"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_flexible_dates: z.boolean().default(false),
  interview_mode: z.enum(["Async", "Video call", "Both"]).default("Async"),
  compensation_type: z.enum(["Fixed price", "Hourly", "Unpaid"]),
  compensation_details: z.string().trim().min(3, "State the compensation details"),
  charges_freelancer_fee: z.boolean().refine(val => val === false, {
    message: "Brief strictly prohibits charging freelancers any application or bidding fees."
  }),
}).refine((data) => {
  if (data.budget_max < data.budget_min) {
    return false;
  }
  return true;
}, {
  message: "Maximum budget cannot be less than minimum budget",
  path: ["budget_max"],
}).refine((data) => {
  if (!data.is_flexible_dates && data.start_date && data.end_date) {
    return data.end_date >= data.start_date;
  }
  return true;
}, {
  message: "Project end date cannot be before start date",
  path: ["end_date"],
});

// Application Submission Schema
export const ApplicationSchema = z.object({
  project_id: z.number(),
  note: z.string().trim().max(1000, "Note must be under 1000 characters").optional(),
  work_sample_url: z.string().trim().url("Must be a valid URL").or(z.literal("")).optional(),
});

// Rating Submission Schema (Immutable post-creation)
export const RatingSchema = z.object({
  project_id: z.number(),
  client_id: z.string(),
  overall: z.number().int().min(1).max(5),
  responded: z.union([z.literal(true), z.literal(false), z.literal("na")]),
  described: z.union([z.literal(true), z.literal(false), z.literal("na")]),
  paid: z.union([z.literal(true), z.literal(false), z.literal("na")]),
  note: z.string().trim().max(500, "Note must be under 500 characters").optional(),
});
