# Brief — Verified Freelance Marketplace

A shippable, secure, and production-ready freelance marketplace built with **Next.js 15 App Router**, **TypeScript**, **Supabase**, **Zod**, and a bespoke **token-driven CSS glassmorphism design system** crafted strictly to the standards in `ui-ux-design-skills (1).md`.

---

## Key Highlights & Features

1. **Two-Sided Workflow**:
   - **Freelancers**: 4-step profile builder with live preview and animated completion ring (`conic-gradient`), 1-click application submission with auto-attached profile, application status tracking, and permanent, honest client ratings.
   - **Clients & Businesses**: 5-step project posting wizard with zero-fee guardrail and date logic, 4-lane Kanban applicant pipeline board (`New`, `Shortlisted`, `Maybe`, `Rejected`), client reputation metrics, and auto-generated social share cards with dynamic canvas QR codes.
   - **Moderation Desk (Admin)**: Multi-tab moderation interface for Identity/Organization verification queues, community abuse report triage, and global listings management.

2. **Security & Quality Control (QC)**:
   - **Zero-Fee Guardrail**: Strict UI and database schema check constraints ensuring no listing can charge freelancers application or bidding fees.
   - **Strict Input Validation**: Centralized Zod validation schemas for freelancer profiles, project briefs, applications, and client ratings.
   - **Row-Level Security (RLS)**: PostgreSQL migration script in `supabase/migrations/001_initial_schema.sql` providing field-level protection.
   - **Immutable Ratings**: Ratings cannot be modified post-submission to preserve marketplace trust and prevent tampering.

3. **Bespoke Design Token System**:
   - Token architecture (`--bg: #ECEAE5`, `--ink: #1E1B29`, `--accent: #5B4E8F`, `--ok: #4E7D5B`, `--warn: #96525A`).
   - Two-font hierarchy: `Instrument Serif` for headlines and emotion + `Instrument Sans` for functional UI and body.
   - Layered ambient shadows, frosted glassmorphism with `prefers-reduced-transparency` fallback, and 44px minimum touch targets on mobile.

4. **Dual Runtime Support**:
   - **Zero-Config Demo Mode**: Works immediately out of the box with seeded demo accounts for Freelancer (`Keerti Sharma`), Client (`Aditya Mehra`), Indie Client (`Rhea Kapoor`), and Admin (`Admin Desk`).
   - **Supabase Production Mode**: Connects seamlessly when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## Supabase Setup (Optional)
To connect your live Supabase database:
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the SQL migration in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor.
3. Create a `.env.local` file with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Project Structure
```
├── src/
│   ├── app/                    # Next.js 15 App Router Pages
│   │   ├── admin/page.tsx      # Admin moderation portal
│   │   ├── auth/page.tsx       # Auth & 1-click demo login
│   │   ├── board/page.tsx      # 4-Lane Kanban applicant board
│   │   ├── clients/[id]/page.tsx # Public client reputation page
│   │   ├── dashboard/page.tsx  # Client overview dashboard
│   │   ├── explore/page.tsx    # Multi-filter search & explore
│   │   ├── my-applications/    # Freelancer tracker & rating modal
│   │   ├── onboarding/page.tsx # 4-Step freelancer profile wizard
│   │   ├── post-project/       # 5-Step client project posting wizard
│   │   ├── projects/[id]/      # Detailed project brief & apply modal
│   │   ├── layout.tsx          # Root layout with fonts & ambient wash
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── cards/              # ProjectCard & SignatureShareCard
│   │   ├── layout/             # Floating Navbar & Footer
│   │   └── ui/                 # TokenInput, SegmentedControl, Modal, Toast, Badge
│   ├── lib/
│   │   ├── store/              # Central state provider & seed data
│   │   ├── supabase/           # Supabase browser & server clients
│   │   └── validation.ts       # Zod validation schemas
│   ├── styles/
│   │   ├── globals.css         # Component styling & animations
│   │   └── tokens.css          # Design tokens & color system
│   └── types/
│       └── index.ts            # TypeScript data model definitions
├── supabase/
│   └── migrations/             # PostgreSQL database schemas & RLS
└── package.json
```
