# UI/UX Technical Reference

Detailed specifications, patterns, and testing methods for each principle.

---

## 1. Accessibility First — Technical Specs

### Contrast Requirements

| Text Type | Minimum Ratio | WCAG Level |
|-----------|--------------|------------|
| Normal text (<18px, or <24px if not bold) | 4.5:1 | AA |
| Large text (≥18px bold, or ≥24px) | 3:1 | AA |
| UI components / graphical objects | 3:1 | AA |
| Enhanced (all text) | 7:1 | AAA |

```css
/* Good — 4.54:1 on white */
.text-primary { color: #595959; }

/* Bad — 2.3:1 on white */
.text-fail { color: #b0b0b0; }
```

**Testing tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools → Inspect element → Computed styles → Contrast ratio badge
- axe DevTools browser extension
- `scripts/check-a11y.ps1` (this skill) for CI

### Focus States

```css
/* Default: visible outline on focus */
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Never do this without replacement */
/* ❌ */ :focus { outline: none; }

/* ✅ Replace with something visible */
.custom-focus:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-focus-ring);
  border-radius: 4px;
}
```

### Keyboard Navigation

| Interaction | Keys |
|------------|------|
| Navigate forward/backward | `Tab` / `Shift+Tab` |
| Activate button/link | `Enter` or `Space` |
| Close dialog/popover | `Escape` |
| Select menu item | `Arrow keys` + `Enter` |
| Navigate tabs | `Left/Right Arrow` |
| Move between radio buttons | `Arrow keys` |

```tsx
/* Keyboard handler pattern */
function handleKeyDown(e: React.KeyboardEvent) {
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowDown') focusNext();
  if (e.key === 'ArrowUp') focusPrevious();
}
```

### Labels vs Placeholders

```html
<!-- ✅ Label present, placeholder as hint -->
<label for="email">Email address</label>
<input id="email" type="email" placeholder="name@company.com" />

<!-- ✅ Visually hidden label with sr-only -->
<label for="search" class="sr-only">Search</label>
<input id="search" type="search" />

<!-- ❌ Placeholder as only label — fails WCAG 3.3.2 -->
<input type="email" placeholder="Email address" />
```

### Semantic HTML Reference

| Purpose | Element |
|---------|---------|
| Page header/branding | `<header>` |
| Main content area | `<main>` |
| Standalone content block | `<article>` |
| Thematic grouping | `<section>` |
| Sidebar/supplementary | `<aside>` |
| Page footer | `<footer>` |
| Navigation landmark | `<nav>` |
| Click-triggered action | `<button>` — never `<div onclick>` |
| Interactive list | `<ul>` with `<li><button>` |
| Modal/dialog | `<dialog>` with `.showModal()` |
| Disclosure/accordion | `<details>` + `<summary>` |

### ARIA Patterns Quick Reference

```html
<!-- Toggle button -->
<button aria-expanded="false" aria-controls="menu-1">Menu</button>
<ul id="menu-1" role="menu" hidden>...</ul>

<!-- Tabs -->
<div role="tablist" aria-label="Product info">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Details</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">Reviews</button>
</div>
<div role="tabpanel" id="panel-1">...</div>

<!-- Current page in nav -->
<a href="/blog" aria-current="page">Blog</a>

<!-- Alert / live region -->
<div role="alert" aria-live="assertive">Form submitted!</div>
```

### Image Alt Text Rules

| Image Type | alt attribute |
|-----------|--------------|
| Informative | Descriptive text of content/function |
| Decorative | `alt=""` (empty, never missing) |
| Complex (chart) | Brief alt + `aria-describedby` pointing to full description |
| Linked image | Describe the link destination, not the image |
| SVG icon | `aria-hidden="true"` + `role="img"` with `<title>` |

---

## 2. Touch-Friendly — Technical Specs

### Tap Target Sizing

```css
/* Minimum 44×44px — WCAG 2.5.5 (AAA) */
.btn {
  min-width: 44px;
  min-height: 44px;
  /* For inline links, add padding */
}

/* Inline links need help */
.nav-link {
  display: inline-block;
  padding: 10px 12px; /* ensures 44px height even with small text */
  line-height: 24px;
}
```

### Thumb Reach Zones (Mobile)

```
┌──────────────────────┐
│    HARD TO REACH     │  ← Stretch zone
│  (nav, search, etc)  │
│──────────────────────│
│                      │
│    COMFORTABLE       │  ← Natural zone
│                      │
│──────────────────────│
│   EASY TO REACH      │  ← Thumb zone
│ (primary actions)    │     Bottom 1/3 of screen
└──────────────────────┘
```

**Implementation strategy:**
- Primary CTA at bottom of mobile views
- Floating action buttons (FAB) at bottom-right
- Toolbars/navigation at bottom for mobile
- Avoid top-left actions on critical flows

### Touch Feedback

```css
/* Visual feedback on tap */
.btn:active {
  transform: scale(0.97);
  transition: transform 100ms ease;
}

/* Ripple effect via ::after pseudo-element */
.btn-ripple {
  position: relative;
  overflow: hidden;
}

/* Hover + touch distinction */
@media (hover: hover) {
  .card:hover { box-shadow: var(--shadow-md); }
}

@media (pointer: coarse) {
  /* Larger touch targets for mobile */
  .btn { min-height: 48px; padding: 12px 24px; }
  /* More spacing between interactive items */
  .list-item + .list-item { margin-top: 12px; }
}
```

### Gesture Support

| Gesture | Common Use | Avoid |
|---------|-----------|-------|
| Swipe left/right | Carousels, tabs | Content-heavy pages (conflicts with scroll) |
| Pull down | Refresh, close modal | Pages without clear affordance |
| Long press | Context menu, tooltip | Essential actions (hidden discoverability) |
| Pinch to zoom | Image galleries, maps | Don't disable on web pages |

---

## 3. Performance — Technical Specs

### Image Loading

```tsx
/* Next.js Image — preferred approach */
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero banner"
  width={1200}
  height={600}
  priority={isLCP}    // preload above-the-fold images
  loading={isLCP ? 'eager' : 'lazy'}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

/* Native lazy loading fallback */
<img src="..." loading="lazy" width="800" height="400" alt="..." />
```

### Layout Shift Prevention (CLS)

```css
/* Always reserve space for async content */
.async-content {
  min-height: 300px; /* prevent jump when content loads */
}

/* Explicit dimensions on media */
img, video, iframe {
  width: 100%;
  height: auto;
  aspect-ratio: attr(width) / attr(height);
}

/* Skeleton placeholder while loading */
.skeleton {
  background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-border) 50%, var(--color-surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### Loading States Pattern

```tsx
function DataComponent() {
  const { data, error, isLoading } = useQuery();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!data?.length) return <EmptyState />;
  return <ListView items={data} />;
}
```

### Reduced Data Mode

```css
@media (prefers-reduced-data: reduce) {
  /* Serve lighter images */
  .hero { background-image: url('/hero-lowres.jpg'); }
  /* Disable autoplay video */
  video { display: none; }
  /* Reduce animation frames */
  .parallax { animation: none; }
}
```

### Offline / Slow-Connection

```tsx
function NetworkAwareComponent() {
  const isOnline = useNetworkStatus();

  if (!isOnline) {
    return (
      <Banner variant="warning">
        You are offline. Some features may be unavailable.
      </Banner>
    );
  }
  // ...
}
```

---

## 4. Consistency — Technical Specs

### Semantic Color Tokens

```css
:root {
  /* Text */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #595959;
  --color-text-disabled: #9e9e9e;
  --color-text-inverse: #ffffff;

  /* Surface / background */
  --color-surface-primary: #ffffff;
  --color-surface-secondary: #f5f5f5;
  --color-surface-elevated: #ffffff;

  /* Border */
  --color-border: #e0e0e0;
  --color-border-focus: #2563eb;

  /* Interactive */
  --color-action-primary: #2563eb;
  --color-action-hover: #1d4ed8;
  --color-action-active: #1e40af;

  /* Semantic */
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-danger: #dc2626;
  --color-info: #0891b2;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: #f5f5f5;
    --color-text-secondary: #a3a3a3;
    --color-surface-primary: #121212;
    --color-surface-secondary: #1e1e1e;
    --color-surface-elevated: #242424;
    --color-border: #333333;
  }
}
```

### Spacing Scale (4px baseline)

| Token | Value | Use |
|-------|-------|-----|
| `space-1` | 4px | Tight internal padding |
| `space-2` | 8px | Icon-to-label gap |
| `space-3` | 12px | Inline item gap |
| `space-4` | 16px | Standard padding |
| `space-6` | 24px | Section padding |
| `space-8` | 32px | Component gap |
| `space-12` | 48px | Large section gap |
| `space-16` | 64px | Layout gutter |
| `space-24` | 96px | Extra-large gap |

### Icon Usage

```tsx
/* ✅ Use icon libraries */
import { Search, Menu, X } from 'lucide-react';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

/* ❌ Never use emoji as UI icons */
<button>🔍 Search</button>

/* Icon sizing standards */
// 16px — inline with body text
// 20px — inline with buttons
// 24px — standalone icon buttons
// 32px — large decorative icons
```

---

## 5. Responsive, Mobile-First — Technical Specs

### Mobile-First CSS Pattern

```css
/* Base: mobile (max-width is implicit) */
.grid { display: grid; gap: 16px; grid-template-columns: 1fr; }

/* Tablet: 640px+ */
@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
}
```

### Preventing Horizontal Scroll

```css
/* Common causes and fixes */
* {
  box-sizing: border-box;    /* prevent padding from causing overflow */
}

img, video, iframe, pre {
  max-width: 100%;           /* media doesn't overflow */
  height: auto;
}

body {
  overflow-x: hidden;        /* last resort — find and fix the cause */
}
```

### Fluid Typography

```css
h1 {
  /* 24px → 48px between 375px → 1280px viewports */
  font-size: clamp(1.5rem, 1rem + 2.5vw, 3rem);
}

p {
  /* 16px → 18px */
  font-size: clamp(1rem, 0.9rem + 0.2vw, 1.125rem);
}

.container {
  /* 90% width → 1200px max */
  width: min(90%, 1200px);
  margin-inline: auto;
}
```

### Viewport Meta (Required)

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
<!-- NEVER add: maximum-scale=1, user-scalable=no -->
```

---

## 6. Readable Typography & Color — Technical Specs

### Font Stack

```css
body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 1rem;      /* 16px */
  line-height: 1.5;
  color: var(--color-text-primary);
}

h1, h2, h3, h4 {
  line-height: 1.2;
  font-weight: 600;
}

/* Measure: 45-75 chars */
article, .prose {
  max-width: 65ch;
  margin-inline: auto;
}
```

### Dark Mode

```css
/* System preference */
@media (prefers-color-scheme: dark) {
  /* ... color overrides ... */
}

/* Toggle strategy: data attribute on <html> */
[data-theme="dark"] {
  --color-surface-primary: #121212;
  --color-text-primary: #f0f0f0;
}
```

```tsx
// Theme toggle hook pattern
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('theme') ?? 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
}
```

### Never Pure Black on White

```css
/* ✅ Softer palette */
:root {
  --color-bg: #fafafa;       /* not #ffffff */
  --color-text: #121212;     /* not #000000 */
}

[data-theme="dark"] {
  --color-bg: #121212;       /* not #000000 */
  --color-text: #e4e4e4;     /* not #ffffff */
}
```

---

## 7. Purposeful Motion — Technical Specs

### Duration Guidelines

| Animation Type | Duration | Easing |
|---------------|----------|--------|
| Button hover/active | 150ms | ease-out |
| Tooltip show/hide | 200ms | ease-out |
| Modal open/close | 200-300ms | ease-out / ease-in |
| Page transition | 300-500ms | ease-in-out |
| Accordion expand | 250ms | ease-out |

### Reduced Motion Guard

```css
/* Always wrap animations */
@media (prefers-reduced-motion: no-preference) {
  .card {
    transition: transform 200ms ease-out, box-shadow 200ms ease-out;
  }
  .card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

/* Disable for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### GPU-Friendly Properties

```css
/* ✅ Composited (no layout/recalc) */
transform: translateX(10px);
transform: scale(1.05);
opacity: 0;
filter: blur(2px);

/* ❌ Triggers layout (expensive to animate) */
width: 200px;
height: 300px;
top: 50px;
left: 100px;
margin-top: 20px;
padding: 16px;
```

### Enter/Exit Pattern

```css
.enter {
  animation: fadeIn 200ms ease-out;
}
.exit {
  animation: fadeOut 150ms ease-in forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(4px); }
}
```

---

## 8. Clear Forms & Feedback — Technical Specs

### Form Structure Pattern

```tsx
function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Field with label + error */}
      <div className="form-field">
        <label htmlFor="name">
          Full name <span aria-hidden="true">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="field-error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? <Spinner /> : 'Send message'}
      </button>

      {status === 'success' && <p role="alert" className="success">Message sent!</p>}
      {status === 'error' && <p role="alert" className="error">Failed to send. Try again.</p>}
    </form>
  );
}
```

### Progressive Disclosure

```html
<!-- ❌ Show everything at once -->
<form>
  <!-- 15 fields visible immediately -->
</form>

<!-- ✅ Gradually reveal -->
<form>
  <!-- 3 required fields -->
  <label for="email">Email *</label>
  <input id="email" type="email" />

  <button type="button" aria-expanded="false" aria-controls="advanced">
    Advanced options
  </button>

  <fieldset id="advanced" hidden>
    <!-- Optional advanced fields -->
  </fieldset>
</form>
```

### Input Type Reference

| Data | `type` | Benefits |
|------|--------|---------|
| Email | `email` | Mobile shows @ key, built-in validation |
| Phone | `tel` | Mobile shows numeric keypad |
| Number | `number` | Shows stepper, numeric input |
| URL | `url` | Validates URL format |
| Search | `search` | Shows search button on mobile |
| Date/time | `date`, `time`, `datetime-local` | Native picker UI |
| Password | `password` | Obscures input, show/hide toggle |

---

## 9. Predictable Navigation — Technical Specs

### Navigation Structure

```
Home
├── Products                  ← Level 1
│   ├── Category A            ← Level 2
│   └── Category B
├── About                     ← Level 1
├── Blog                      ← Level 1
└── Contact                   ← Level 1

// Maximum depth: 3 levels
// Maximum primary items: 5–7
```

### Breadcrumbs

```tsx
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Widget Pro</li>
  </ol>
</nav>
```

### Current Page Indicator

```css
.nav-link[aria-current="page"] {
  color: var(--color-action-primary);
  font-weight: 600;
  /* Visual indicator */
  box-shadow: inset 0 -2px 0 currentColor;
}
```

### Back Button Integrity

```tsx
// Never replace history unless intentional
// ✅ Let browser handle back naturally
router.push('/products/' + slug);

// ❌ Replace prevents going back
router.replace('/products/' + slug);

// ❌ Forcing history.pushState to break back
window.history.pushState({}, '', '/products');
window.onpopstate = () => router.push('/'); // Broken!
```

---

## 10. Honest Data Visualization — Technical Specs

### Never Color-Only Meaning

```svg
<!-- ❌ Color-only — inaccessible to colorblind users -->
<!-- Two lines, only distinguished by red vs green -->

<!-- ✅ Color + pattern -->
<!-- <line stroke="red"  stroke-dasharray="4,2" /> -->
<!-- <line stroke="green" /> -->
<!-- Plus visible labels on each line -->
```

### Chart Accessibility Pattern

```tsx
function AccessibleChart({ data }: { data: ChartData[] }) {
  return (
    <figure>
      <figcaption id="chart-desc">
        Revenue grew 23% YoY from $1.2M to $1.48M
      </figcaption>

      {/* Visual chart */}
      <svg aria-labelledby="chart-title" role="img">
        <title id="chart-title">Revenue Growth Chart</title>
        {/* ... chart elements ... */}
      </svg>

      {/* Screen reader alternative */}
      <table className="sr-only" aria-label="Revenue data table">
        <thead>
          <tr><th>Month</th><th>Revenue</th></tr>
        </thead>
        <tbody>
          {data.map(d => (
            <tr key={d.month}><td>{d.month}</td><td>${d.revenue.toLocaleString()}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
```

### Colorblind-Safe Palettes

**Okabe-Ito palette (8 colors, CVD-safe):**

| Color | Hex | Role |
|-------|-----|------|
| Black | `#000000` | Primary text |
| Orange | `#E69F00` | Category A |
| Sky Blue | `#56B4E9` | Category B |
| Bluish Green | `#009E73` | Category C |
| Yellow | `#F0E442` | Category D |
| Blue | `#0072B2` | Category E |
| Vermilion | `#D55E00` | Category F |
| Reddish Purple | `#CC79A7` | Category G |

### Zero-Baseline Rule

```
✅ Y-axis starts at 0
│     ██
│   ████
│ ██████
│████████
└────────

❌ Truncated Y-axis (misleading)
│  ██
│ ████
│██████
└────────  ← starts at 80, not 0
```

Exception: when the meaningful variation is less than 10% of the data range, state clearly: *"Y-axis does not start at 0 to highlight the trend"*.

### Chart Legend & Tooltip Rules

- Legend must be visible, not hidden behind a toggle
- Tooltips must be keyboard-accessible (focus or on-demand trigger)
- Data labels directly on the chart for critical values
- Units of measurement always visible

---

## Testing Methods

### Automated

| Tool | What It Checks | When |
|------|---------------|------|
| `axe-core` / axe DevTools | WCAG violations | Dev + CI |
| Lighthouse | Performance, a11y, SEO, best practices | Dev + CI |
| `eslint-plugin-jsx-a11y` | JSX a11y rules | Pre-commit |
| `scripts/check-a11y.ps1` | CSS/HTML pattern violations | CI / manual |
| Chrome DevTools | Contrast, focus order, layout shift | Manual dev |

### Manual

1. **Keyboard-only walkthrough**: Tab through every interactive element. Can you reach everything? Is focus order logical? Is focus visible?
2. **Screen reader test** (VoiceOver, NVDA, or JAWS): Navigate the page. Is content announced in order? Are icons labeled? Are live regions announced?
3. **200% zoom test**: Zoom to 200%. Does content reflow? Is anything cut off? Is horizontal scroll present?
4. **Color filter simulation**: Use Chrome DevTools → Rendering → Emulate vision deficiencies. Are all distinctions still visible?
5. **Touch test on real device**: Tap every interactive element. Is it easy? Is feedback clear? Are actions within thumb reach?
6. **Slow 3G throttling**: Chrome DevTools → Network → Slow 3G. Does the page show meaningful content? Are loading states clear?
