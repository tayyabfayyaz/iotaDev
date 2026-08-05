---
name: ui-ux
description: Enforce UI/UX best practices — accessibility, touch, performance, responsive layout, typography, motion, forms, navigation, and data visualization. Use when building or reviewing any UI component, page, or design system.
metadata:
  audience: frontend
  discipline: design-engineering
---

## What I do

I enforce a set of 10 non-negotiable UI/UX principles on every frontend change. I review code for violations, suggest fixes, and provide concrete CSS/HTML/JS patterns.

## When to use me

Use me when:
- Building or editing any React/Next.js component, page, or layout
- Reviewing CSS, Tailwind config, or design tokens
- Implementing forms, navigation, data visualizations, or animated elements
- Auditing an existing page or component for UX issues
- Setting up or modifying a design system / theme

## Core Principles

### 1. Accessibility First
- **4.5:1** minimum contrast ratio for normal text, **3:1** for large text (18px+ bold, or 24px+)
- Visible `:focus-visible` outlines on every interactive element — never use `outline: none` without a replacement
- Full keyboard navigation: Tab/Shift+Tab, Enter/Space to activate, Escape to dismiss
- Every input has a real `<label>` — placeholders are hints, not labels
- Use semantic HTML: `<button>`, `<nav>`, `<main>`, `<header>`, `<dialog>`, etc.
- Add `aria-label` or `aria-labelledby` where visual labels aren't enough
- Images must have meaningful `alt` text; decorative images use `alt=""`
- `role`, `aria-expanded`, `aria-selected`, `aria-current` on interactive components

### 2. Touch-Friendly
- Minimum **44×44px** tap target for every interactive element
- Primary actions within **thumb reach** (bottom of screen on mobile)
- Provide visible feedback (background change, scale, ripple) on every touch interaction
- No hover-only interactions — they must work on tap
- Use `@media (pointer: coarse)` to adjust spacing/sizing for touch devices
- Pull-to-refresh and swipe gestures should have clear affordance

### 3. Performance
- Lazy-load all below-the-fold images: `loading="lazy"` or framework equivalents
- Use Next.js `<Image>` component for automatic optimization
- Specify explicit `width` and `height` on every image to prevent CLS
- **CLS < 0.1** — never insert content above existing content after load
- Respect `prefers-reduced-data` and serve lighter assets when indicated
- Show skeleton or spinner states, not blank screens, during async operations
- Graceful offline handling: cached shells, retry logic, friendly error messages

### 4. Consistency
- One visual style per project — no mixing of icon sets, spacing scales, or type scales
- Use **semantic color tokens** (`--color-text-primary`, `--color-surface`, `--color-danger`), not arbitrary hex values
- Real SVG icons (Lucide, Heroicons, Phosphor), never emoji for UI elements
- Predictable component behavior: same props, same patterns, same naming
- Shared spacing scale: 4px baseline grid (4, 8, 12, 16, 24, 32, 48, 64, 96)

### 5. Responsive, Mobile-First
- Write **mobile-first** CSS: base styles for small screens, `min-width` media queries scale up
- Never produce horizontal scroll — all content fits within the viewport
- Never disable user zoom: `<meta name="viewport" content="width=device-width, initial-scale=1">` and no `maximum-scale=1`
- Use **fluid units**: `rem`, `%`, `vw`, `fr`, `clamp()` — avoid fixed `px` for layout
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl), 1536px (2xl)

### 6. Readable Typography & Color
- Body text minimum **16px** (1rem)
- Line-height minimum **1.5** for body text, **1.2–1.3** for headings
- Measure (line length): 45–75 characters per line
- Sufficient contrast on all text (4.5:1) and UI components (3:1)
- **Dark mode by default** — use `prefers-color-scheme: dark` or a theme toggle
- Never use pure black (`#000`) on pure white (`#fff`) — use `#121212` / `#fafafa` or similar
- Font stack: system fonts first (`system-ui, -apple-system, sans-serif`)

### 7. Purposeful Motion
- Animations must communicate state or relationship, never decorate
- Duration: **150–300ms** for micro-interactions; 300–500ms for page transitions
- Easing: `ease-out` for entering, `ease-in` for exiting, `cubic-bezier` for custom
- Always wrap animations in `@media (prefers-reduced-motion: no-preference)`
- Prefer `transform` and `opacity` for animations (GPU-composited, no layout thrashing)
- Use `prefers-reduced-motion: reduce` to disable all non-essential motion

### 8. Clear Forms & Feedback
- Every form field has a **visible label** above or beside the input
- Inline validation errors appear **next to the offending field**, not in a toast or summary
- Use **progressive disclosure**: show only what's needed now, reveal more as needed
- Clear submit states: idle → loading (spinner on button) → success/error
- Required fields marked with an asterisk `*` and `aria-required="true"`
- Input types match data: `type="email"`, `type="tel"`, `type="number"`, `type="date"`

### 9. Predictable Navigation
- Simple, shallow navigation structure — **no more than 3 levels** deep
- Back button always works as expected (no history manipulation)
- Limit nav items to **5–7** for primary navigation (Miller's law)
- Current page clearly indicated with `aria-current="page"` and visual styling
- Deep linking: every meaningful state has its own URL
- Breadcrumbs for sites with more than 2 levels of hierarchy

### 10. Honest Data Visualization
- Every chart/graph includes visible **legends and tooltips**
- Never convey meaning with **color alone** — use patterns, labels, or shapes as secondary indicators
- Y-axis must start at **zero** unless it would obscure a meaningful pattern (then clearly note it)
- Accessible alternative for complex charts: `table` element or `aria-describedby` with text summary
- Responsive charts that reflow on small screens, not just scale down
- Use colorblind-safe palettes (Okabe-Ito, Tol, ColorBrewer)

## Review Checklist

When reviewing any UI change, verify in this order:

1. [ ] **A11y**: contrast, focus, keyboard, labels, semantic HTML
2. [ ] **Touch**: 44×44 targets, thumb reach, feedback
3. [ ] **Perf**: lazy loading, CLS prevention, async states
4. [ ] **Consistency**: tokens, icons, spacing scale, patterns
5. [ ] **Responsive**: mobile-first, no scroll, zoom enabled
6. [ ] **Type**: 16px+, 1.5 line-height, contrast, dark mode
7. [ ] **Motion**: purposeful, 150-300ms, reduced-motion guard
8. [ ] **Forms**: labels, inline errors, progressive disclosure
9. [ ] **Nav**: depth ≤ 3, back button, current indicator, ≤ 7 items
10. [ ] **Data viz**: legends, non-color meaning, zero-baseline

## Supporting Files

- `reference.md` — detailed technical reference with CSS/HTML patterns, WCAG criteria, and testing methods
- `scripts/check-a11y.ps1` — PowerShell script to scan a codebase for common accessibility violations
