# UI/UX Design Skills — Reference

A checklist of the design principles, patterns, and techniques used in building the Brief / Slate-style app. Use this as a style guide or a prompt-reference when building similar product UIs.

---

## 1. Visual System (Design Tokens)

- **Token-driven theming** — every color, radius, and shadow is a CSS custom property (`--accent`, `--r`, `--shadow`), never hardcoded inline. Swapping a brand palette is a one-line change.
- **Restrained palette** — one accent hue + tints (10%/16% opacity mixes) instead of many colors. Semantic colors (`--ok`, `--warn`) are separate from brand color so status never competes with brand.
- **Two-font system** — a serif display face (`Instrument Serif`) for headlines/emotion, a sans face (`Instrument Sans`) for UI/body. Serif is reserved for `h1–h3` and "moment" numbers (ratings, stats); everything functional stays sans.
- **8px-ish spacing rhythm** — margins/paddings cluster around a consistent scale (`.35rem / .5rem / .7rem / 1rem / 1.4rem / 2rem`) rather than arbitrary values.
- **Consistent radius scale** — `--r` (18px) for cards/panels, `--r-sm` (12px) for inputs/chips, `999px` for pills/buttons. Radius signals hierarchy: bigger radius = bigger container.
- **Layered shadow tokens** — a soft ambient shadow + a stronger hover shadow (`--shadow-soft`, `--shadow`), both built from two stacked shadows (tight + diffuse) rather than one heavy blur.

## 2. Material & Depth

- **Glassmorphism with a hard fallback** — `backdrop-filter: blur() saturate()` for nav/cards, wrapped in `@supports not (...)` and `prefers-reduced-transparency` fallbacks to solid white. Never ship a glass effect without a non-blur fallback.
- **Ambient background wash** — a fixed, pointer-events-none layer with multiple soft radial gradients behind the UI, instead of a flat background. Adds depth without adding visual noise to content.
- **Inset highlight on glass** — `box-shadow: inset 0 1px 0 rgba(255,255,255,.6)` on glass surfaces to simulate a light catching the top edge — the detail that sells "frosted glass" over "semi-transparent gray."

## 3. Layout Patterns

- **Floating pill nav** — nav is a rounded, blurred bar with margin on all sides (not edge-to-edge), signaling "controls" vs. "canvas."
- **Sticky two-column detail layout** — main content scrolls, a sidebar of supporting panels (`position: sticky; top:`) stays in view. Used for project detail, onboarding preview, and post-a-project summary.
- **Responsive collapse to single column** — every multi-column grid (`hero-grid`, `detail-grid`, `flow-wrap`, `journeys`) has one breakpoint where it becomes `grid-template-columns: 1fr` and sticky elements become static — no separate mobile layout to maintain.
- **Horizontal-scroll board on mobile** — a 4-column kanban becomes `grid-auto-flow: column` with `scroll-snap-type: x proximity` under 1024px instead of stacking vertically, preserving the "board" mental model on a phone.
- **Card grid with `auto-fill, minmax()`** — `repeat(auto-fill, minmax(290px,1fr))` so card grids reflow naturally at any viewport without manual breakpoints per column count.

## 4. Component Patterns

- **Segmented control (`.seg`)** — pill-shaped multi-button single-select, used wherever a form field is a short enumerated choice (experience level, compensation type, interview mode). Preferred over `<select>` when there are ≤3 options — it's scannable and touch-friendly.
- **Token / tag input (`.tk`)** — custom "select from list or type your own" chip input (skills, tools, cities). Combines the discoverability of a dropdown with the flexibility of free text, with an "Add 'x' — not in list" affordance so the field never blocks on missing options.
- **Badge system** — small pill labels with semantic color variants (`b-verify`, `b-paid`, `b-unpaid`, `b-warn`) so status is scannable by color+icon before reading text.
- **Completion ring** — a `conic-gradient` progress ring (`--p` custom property driving percentage) on the live profile preview, giving passive, ambient feedback on form completion without a nagging banner.
- **Live preview pane** — as a user fills a multi-step form, a sticky card on the side updates in real time (`syncPreview()` / `syncSummary()` on every input). Removes the "fill blind, hope it looks right" gap in long forms.
- **Progress stepper with numbered fraction** — "Step 2 of 4" text + a thin animated progress bar, not just the bar alone — gives both a precise and an ambient sense of progress.
- **Rating bars vs. star icons** — trust metrics ("Responded to applications," "Paid as stated") are shown as labeled percentage bars with a sample-size caption ("from 5 ratings"), not abstract stars — more honest and more useful for a marketplace-trust use case.
- **Bottom-sheet modal on mobile, centered dialog on desktop** — one `.modal` component, two positioning rules gated by media query (`align-items:flex-end` → `center`), so mobile gets the native "sheet" feel for free.
- **Toast, not alert** — transient bottom-center toast for confirmations ("Application submitted"), reserving modals for things that need a decision.

## 5. Form & Flow UX

- **Multi-step flows with a review step before commit** — onboarding and "post a project" both end in a read-only summary screen before the final publish action, so nothing is submitted without a last look.
- **Inline field-level validation, not top-of-form error dumps** — errors attach directly under the offending field (`.field.bad` + `.err`), and the view auto-scrolls to the first error. Validation runs per-step, not just on final submit, so users fail fast and locally.
- **Guardrails as UI, not just backend rules** — the "does this cost freelancers money?" question renders a warning block and disables the Continue button live, instead of silently rejecting on submit — the policy is visible *as* the user answers it.
- **Progressive disclosure of optional complexity** — a checkbox ("Dates not locked yet") suppresses the validation requirement on two other fields, instead of adding an extra step just for edge cases.
- **Smart date constraints** — `min`/`max` on date inputs are set and re-set based on other answers (project can't start before applications close; date of birth can't be in the future) rather than trusting free text.
- **Demo/seed shortcuts for prototypes** — one-tap "demo login" buttons for each role during testing/demo, clearly separated from the real auth flow — lets reviewers explore every account type in seconds.

## 6. Navigation & State

- **Role-aware navigation** — the nav bar's link set is generated from the signed-in role (`NAVS[role]`), not hidden/shown via CSS — freelancers, clients, and admins each see only the sections relevant to them.
- **Deep-linkable views via hash routing** — every view and modal pushes to `history` (`#role-3`, `#team-brightloop`) so back/forward and shareable links work in what is otherwise a single-page app.
- **Modal-aware back button** — browser/Android back closes an open modal first, then navigates, matching native app expectations instead of jumping the whole page back.
- **Empty states with next action** — every list (applications, board lanes, admin queues) has a designed empty state with a short explanation, not just blank space.

## 7. Accessibility

- **Visible focus rings everywhere** (`:focus-visible`), not suppressed for aesthetics.
- **Associated labels** — every input is programmatically linked to its `<label>` (`for`/`id`), including dynamically generated token-field inputs (`aria-label` derived from the field's own label text).
- **Keyboard-operable custom components** — card "buttons" that are really `<div role="button">` get `tabindex="0"` and `onkeydown` handling for Enter/Space; the token menu is fully keyboard-navigable (Enter to add, Backspace to remove last chip, Escape to close).
- **Focus trap in modals** — Tab/Shift+Tab cycle within an open modal instead of escaping to page content behind it; focus returns to the triggering element on close.
- **Reduced-motion respect** — a global `prefers-reduced-motion: reduce` query disables animation/transition globally, not just on the hero.
- **44px minimum touch targets** — enforced via a dedicated media query (`pointer:coarse`) that bumps buttons, chips, and menu items to at least 44×44px only on touch devices, without bloating the desktop UI.
- **16px minimum input font size on mobile** — prevents iOS Safari's automatic zoom-on-focus, which is a common overlooked mobile-web bug.

## 8. Motion & Micro-interactions

- **Purposeful, short transitions only** — hover lifts (`translateY(-1px/-3px)`), button press (`translateY(1px)` on `:active`), view fade-in-and-rise on route change — all under ~350ms, all easing, none decorative-only.
- **Success state as its own step**, not a toast — publishing a listing or profile ends on a dedicated confirmation screen with a checkmark pop animation, giving the action weight proportional to its importance.
- **Skeleton-free progressive rendering** — data-driven sections (cards, panels, board lanes) are built from JS template functions run once at init and on state change, avoiding layout jank from lazy/async loading in a prototype context.

## 9. Content & Microcopy

- **Field sub-labels for scope, not just placeholders** — e.g. "Freelancing since — *private*" or "Additional skills — *optional*" tells the user both what to enter and what happens to it.
- **Policy stated as a fact, not a legal disclaimer** — "Freelancers pay nothing. No bidding fees..." is written as a plain declarative sentence in the hero, not buried in terms.
- **Numbers over adjectives for trust** — "23 ratings," "from 5 ratings," "Profile completion — 4 of 6 fields" instead of vague qualifiers like "well reviewed."

## 10. Engineering-adjacent UX Discipline

- **Design tokens reused identically across light/hover/active/disabled states** so state changes read as *the same component reacting*, not a different component.
- **One component, many contexts** — the same badge, card, and panel markup is reused for freelancer-facing and client-facing screens, keeping the whole app visually coherent without a second design pass.
- **Fallback-first for progressive enhancement** — every advanced CSS feature (backdrop-filter, `:has`-free selectors, conic-gradient) has a plain fallback so the app degrades gracefully instead of breaking on unsupported browsers.

---

## 11. Agentic / AI-native Interface Patterns

Sourced from [Beautiful UI](https://www.beautifului.dev/) — a small, MIT-licensed, copy-paste component library built specifically for interfaces where an AI agent is doing visible work alongside a human. Distinct from the marketplace/form patterns above: these solve the problem of *making an agent's process legible*, not just collecting input. Worth knowing even for non-agent products, since several patterns (approval flows, diff review, live status) generalize well.

- **Loading state with elapsed time** — a shimmer/pixel loader paired with a running timer (`0.0s`), not just a spinner. Turns an indefinite wait into a bounded, honest one — the user can see the system is alive and how long it's taking, not just that it's "loading."
- **Expandable "thinking" trace** — reasoning/search/coding steps collapsed by default into a single line, expandable on demand. Keeps the primary answer uncluttered while still offering an audit trail for users who want it — progressive disclosure applied to *process*, not just form fields.
- **Streaming text with inline sources** — cited sources appear as small favicon chips inline with streamed prose, plus a running "10 sources" counter and follow-up question chips at the end. Treats citations as first-class UI, not footnotes.
- **Approval card (human-in-the-loop)** — before an agent acts, it asks a scoped multiple-choice question ("How many flavors should we launch?") instead of open text — narrows the decision to a tappable set of options, lowering the cost of staying in the loop.
- **Tool chips** — compact, collapsed summaries of what an agent did ("4 tool calls, 2 messages") instead of a raw log dump. Detail is available but not forced on the user by default.
- **Task rows with live status** — nested, indentable rows (running / failed / completed) for multi-step agent work, each with its own progress or sub-count (e.g. "12/12 matched"). This is the agentic equivalent of the kanban board pattern — status visible at a glance, detail on expand.
- **Recommendation card with a confidence meter** — an agent's suggested action shown with an explicit confidence label ("High confidence") and named alternatives with their own confidence ("Needs review," "No signal") — makes the agent's certainty visible instead of presenting all suggestions with equal authority.
- **Context cards** — retrieved knowledge chunks shown as small cards with source file, length, and a snippet — lets a user verify *what the agent actually read* before trusting its answer.
- **Diff table** — proposed bulk edits to tabular data shown as an inline diff (additions/changes highlighted per cell) rather than a silent overwrite — critical for trust when an agent is allowed to touch a user's real data.
- **Fine-tune / inspector card** — an agent adjusting a design property (width, radius, opacity) exposes the same numeric fields a human designer would use, so the human can nudge the same values the agent just set. Keeps agent output editable in the tool's own vocabulary instead of a black box.
- **Selection → agent actions** — highlighting a passage of text surfaces a small floating menu (Explain / Improve / Shorten / Tone / Grammar) scoped to just that selection, rather than routing every request through a general chat box.
- **Prompt bar with `@` sources and `/` commands** — a composer that supports referencing context and invoking commands inline, with a model picker and dictation built into the same control, so the input field carries capability instead of being plain text.

**Where this applies to your work:** if plumbsnlevels or any freelance-tooling project ever adds an AI assistant (e.g. "suggest copy for this brief," "summarize applicant fit"), these are the patterns to reach for — particularly the approval card, tool chips, and confidence-labeled recommendation card, which keep an AI feature feeling reviewable rather than opaque.

---

### How to use this in your IDE
Drop this file into your project (e.g. `docs/ui-ux-principles.md`) and reference it when prompting an AI pair-programmer or reviewing a PR — it doubles as a design-review checklist: *"Does this new screen follow the token system? Does the form validate inline? Is there a keyboard path? Does it collapse to one column?"*
