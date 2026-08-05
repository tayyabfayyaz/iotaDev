# Skill Creator — Technical Reference

Detailed patterns, templates, schemas, and methodology for building high-quality OpenCode agent skills.

---

## Table of Contents

1. [SKILL.md Structure Templates](#1-skillmd-structure-templates)
2. [Description Writing Guide](#2-description-writing-guide)
3. [Reference File Patterns](#3-reference-file-patterns)
4. [Script Bundling Patterns](#4-script-bundling-patterns)
5. [Eval & Testing Schema](#5-eval--testing-schema)
6. [Description Optimization Methodology](#6-description-optimization-methodology)
7. [Common Skill Archetypes](#7-common-skill-archetypes)
8. [Skill Structure Validation Rules](#8-skill-structure-validation-rules)

---

## 1. SKILL.md Structure Templates

### Template A: Enforcer Skill (Rules & Validation)

Skills that define rules and check compliance. Use for linting, best practices, code style.

```markdown
---
name: <name>
description: <pushy description with trigger words>
metadata:
  audience: <frontend|backend|all>
  discipline: <category>
---

## What I do
Brief summary of what rules I enforce and when to invoke me.

## When to use me
- Building or editing <type> components/files
- Reviewing <type> code
- Setting up <type> configuration

## Core Principles

### 1. <Principle Name>
- Concrete rule with specific values
- What to do and what to avoid
- Code example showing correct pattern

### 2. <Principle Name>
...

## Review Checklist
1. [ ] Check 1
2. [ ] Check 2
...

## Supporting Files
- `reference.md` — detailed specs and patterns
- `scripts/check.ps1` — automated scanner
```

### Template B: Workflow Skill (Step-by-Step Process)

Skills that guide the agent through a multi-step process. Use for deployments, migrations, onboarding.

```markdown
---
name: <name>
description: <pushy description with trigger words>
metadata:
  audience: <audience>
  discipline: <category>
---

## What I do
Step-by-step workflow for <process name>.

## When to use me
- User wants to <action> or mentions <keywords>
- Context involves <scenario>

## Workflow

### Phase 1: <Name>
1. Step detail
2. Step detail

### Phase 2: <Name>
...

## Safety Checks
Before proceeding, verify:
1. [ ] Precondition 1
2. [ ] Precondition 2
...
```

### Template C: Expert Skill (Knowledge & Advice)

Skills that provide specialized knowledge. Use for domain-specific guidance, architecture decisions, technology recommendations.

```markdown
---
name: <name>
description: <pushy description with trigger words>
metadata:
  audience: <audience>
  discipline: <category>
---

## What I do
Provide expert guidance on <domain>.

## When to use me
- User asks about <topic>, <topic>, or <topic>
- User mentions <keyword>, <keyword>
- Context involves <scenario>

## Knowledge Areas

### <Area 1>
Key facts, patterns, and recommendations.

### <Area 2>
...

## Common Patterns
| Scenario | Recommendation | Rationale |
|----------|---------------|-----------|
| ... | ... | ... |

## Anti-Patterns
| Pattern | Why It Fails | Alternative |
|---------|-------------|-------------|
| ... | ... | ... |
```

### Template D: Generator Skill (Creates Outputs)

Skills that produce files, code, or artifacts. Use for code generators, scaffolding, documentation.

```markdown
---
name: <name>
description: <pushy description with trigger words>
metadata:
  audience: <audience>
  discipline: <category>
---

## What I do
Generate <output type> from <input type>.

## When to use me
- User wants to create/generate <thing>
- User mentions <keyword>, <keyword>

## Input Requirements
Before generating, I need:
1. Requirement 1
2. Requirement 2

## Output Format
```
<exact template or structure>
```

## Generation Rules
1. Rule 1
2. Rule 2

## Examples
**Input:** <example input>
**Output:** <example output>
```

---

## 2. Description Writing Guide

### The Description is the Trigger

The `description` field in frontmatter is the **only** thing the agent reads from the skill before deciding to load it. It must be:
1. **Specific enough** to match the right prompts
2. **Broad enough** to cover all valid use cases (including near-synonyms)
3. **Pushy enough** to overcome the agent's tendency to under-trigger

### Anatomy of a Good Description

```
<What the skill does> — <key capabilities and domains>. Use when <trigger contexts: topics, phrases, file types, actions>. Also use when <edge cases and near-misses> — even if <common scenario where user wouldn't explicitly ask>.
```

### Examples — Good vs Bad

| Bad Description | Good Description | Why It's Better |
|----------------|-----------------|-----------------|
| "API design rules" | "Enforce REST API best practices for FastAPI backends — endpoint naming, status codes, response shapes, error handling, security, Pydantic schemas, dependency injection, async patterns, and client consumption. Use when building, reviewing, or debugging any API endpoint, route, or HTTP client call." | Names specific topics, lists triggers explicitly |
| "Helps with CSS" | "Enforce UI/UX best practices — accessibility, touch, performance, responsive layout, typography, motion, forms, navigation, and data visualization. Use when building or reviewing any UI component, page, or design system." | Covers the full scope, not just CSS |
| "Creates docker files" | "Build and optimize Docker containers — Dockerfiles, docker-compose, multi-stage builds, image optimization. Use when user mentions Docker, containers, deployment, orchestration, or wants to containerize an application — even if they just say 'ship this' or 'deploy to production.'" | Adds synonyms and casual triggers |

### Description Length

- **Minimum**: 50 characters (enough to convey scope)
- **Optimal**: 100–300 characters (detailed but scannable)
- **Maximum**: 1024 characters (OpenCode limit)

### Trigger Words Strategy

For each skill domain, brainstorm:
1. **Direct terms**: the official name of the thing (e.g., "FastAPI", "REST API")
2. **Action verbs**: what users do with it ("build", "create", "debug", "review")
3. **Casual synonyms**: how non-experts describe it ("backend code", "server routes")
4. **File/context clues**: file types, directory names, error messages ("*.py", "main.py", "HTTP 500")
5. **Near-miss terms**: related concepts that should trigger ("endpoint", "route", "controller")

### Testing Description Triggers

**Template eval query set (20 items):**

```json
[
  {"query": "can you create a new API route for user profiles?", "should_trigger": true},
  {"query": "my endpoint returns 500 when the slug is missing, help me debug", "should_trigger": true},
  {"query": "add POST handler to blog router", "should_trigger": true},
  {"query": "whats the right status code for duplicate resource?", "should_trigger": true},
  {"query": "review my backend code for security issues", "should_trigger": true},
  {"query": "i need a pydantic model for creating posts", "should_trigger": true},
  {"query": "how do i handle errors in fastapi?", "should_trigger": true},
  {"query": "setup CORS for my api", "should_trigger": true},
  {"query": "my fetch call to /api/users is failing", "should_trigger": true},
  {"query": "create a new HTML page with a contact form", "should_trigger": false},
  {"query": "install react and set up a new project", "should_trigger": false},
  {"query": "what's the best CSS framework for this?", "should_trigger": false},
  {"query": "deploy to Vercel", "should_trigger": false},
  {"query": "how do I write a SQL query to join two tables?", "should_trigger": false},
  {"query": "add state management with zustand", "should_trigger": false},
  {"query": "fix my typescript types for the blog component", "should_trigger": false},
  {"query": "set up eslint and prettier config", "should_trigger": false},
  {"query": "write a unit test for the calculateTotal function", "should_trigger": false},
  {"query": "add dark mode toggle to the navbar", "should_trigger": false},
  {"query": "look at this 3d model i want to render with three.js", "should_trigger": false}
]
```

**Key**: should-not-trigger queries should be *near-misses* — adjacent domains that share some keywords but need different skills. "Write a fibonacci function" is too easy and doesn't test anything useful.

---

## 3. Reference File Patterns

### When to Create reference.md

- SKILL.md exceeds 300 lines → move details to reference.md
- The skill covers multiple technologies → create per-variant reference files
- The skill needs code examples that would clutter the main file

### reference.md Structure

```markdown
# <Skill Name> — Technical Reference

## Table of Contents
1. [Section 1](#1-section-1)
2. [Section 2](#2-section-2)
...

---

## 1. Section Name
Content with code examples, patterns, tables.

### Subsection
More detail.

## 2. Anti-Patterns Checklist
| Anti-Pattern | Why It's Bad | Fix |
|-------------|-------------|-----|
| ... | ... | ... |
```

### Multi-Variant Reference Pattern

```
skill-name/
├── SKILL.md (workflow + selection guide)
└── references/
    ├── aws.md      ← Agent reads only this for AWS context
    ├── gcp.md      ← Agent reads only this for GCP context
    └── azure.md    ← Agent reads only this for Azure context
```

SKILL.md should guide the agent to the right file:
```markdown
## Platform References
- For AWS deployments, read `references/aws.md`
- For GCP deployments, read `references/gcp.md`
- For Azure deployments, read `references/azure.md`
```

### File Size Guidelines

| File | Max Lines | Rationale |
|------|----------|-----------|
| SKILL.md | 500 | Loaded on every trigger — keep lean |
| reference.md | 800 | Loaded on demand — can be comprehensive |
| Per-variant reference | 300 | Read one at a time — targeted and focused |
| Scripts | Unlimited | Executed, not loaded into context |

If reference.md exceeds 800 lines:
- Include a table of contents at the top
- Or split into `references/` with multiple focused files

---

## 4. Script Bundling Patterns

### Should I Bundle This Script?

| Scenario | Bundle? | Reason |
|----------|---------|--------|
| Agent writes the same 20-line script every time | **Yes** | Saves tokens every invocation |
| Complex but domain-specific logic | **Yes** | Avoids errors from ad-hoc implementation |
| Simple one-liner | **No** | More efficient in SKILL.md instructions |
| General-purpose operation (read file, parse JSON) | **No** | Agent already has these tools |
| User-specific configuration | **No** | Put in instructions, not a script |

### PowerShell Script Convention (OpenCode)

```powershell
# script-name.ps1
# Purpose: <one-line description>
# Usage: .\script-name.ps1 [-Param1 <value>] [-Param2]
#   -Param1 : Description (default: value)
#   -Param2 : Description (switch)

param(
    [string]$Param1 = "default",
    [switch]$Param2
)

$ErrorActionPreference = "Stop"

# --- Main logic ---
Write-Host "Doing something..." -ForegroundColor Cyan

# Always report results
Write-Host "Done. $result" -ForegroundColor Green
```

### Telling the Skill About Scripts

In SKILL.md, reference scripts clearly:

```markdown
## Supporting Files

- `reference.md` — detailed specs
- `scripts/check.ps1` — scan for violations. Run with `-Path <dir>` to target a specific directory, `-Strict` for CI.
- `scripts/init.ps1` — create template. Run with `-Name <name> -Description "<desc>"`.
```

---

## 5. Eval & Testing Schema

### Test Case Format

```json
{
  "skill_name": "my-skill",
  "evals": [
    {
      "id": 1,
      "name": "create-basic-endpoint",
      "prompt": "Add a new GET /api/products endpoint that returns a list of products from the database",
      "expected_output": "A route handler with @app.get('/api/products'), response_model=list[ProductResponse], 200 status",
      "files": ["backend/main.py"],
      "assertions": [
        {
          "id": "a1",
          "description": "Route uses correct HTTP method (GET)",
          "check": "route_method == 'GET'"
        },
        {
          "id": "a2",
          "description": "Response model is defined",
          "check": "has_response_model == true"
        }
      ]
    }
  ]
}
```

### Assertion Types

| Type | Example | Use When |
|------|---------|----------|
| Pattern match | `content contains '@app.get'` | Checking code structure |
| File exists | `file 'output.csv' exists` | Verifying generation |
| Count | `count(items) >= 5` | Checking lists |
| Structure | `json has key 'data.meta'` | Validating output shape |
| Semantic | `'status code 201' is documented` | Checking best practices |

### Running Tests

For each test case:
1. Spawn one run with the skill active
2. Spawn one baseline run without the skill (or with old version)
3. Compare outputs
4. Grade assertions
5. Present to user for qualitative review

---

## 6. Description Optimization Methodology

### Step-by-Step Process

1. **Generate trigger eval set** (20 queries): 10–12 should-trigger, 8–10 should-not-trigger
   - Should-trigger: varied phrasings, casual language, typos, indirect references
   - Should-not-trigger: near-misses, adjacent domains, shared keywords but different intent

2. **User review**: Present the eval set to the user. They know their use case best — make sure the trigger/no-trigger classifications are correct.

3. **Test current description**: For each query, check if the agent would actually load the skill. Track pass rate (triggers when it should, doesn't when it shouldn't).

4. **Analyze failures**:
   - **False negative** (didn't trigger when it should): description too narrow. Add missing keywords, synonyms, contexts.
   - **False positive** (triggered when it shouldn't): description too broad. Add scope boundaries, counter-examples.

5. **Propose revision**: Write a new description aimed at fixing the specific failures.

6. **Re-test**: Run the eval set against the new description.

7. **Iterate**: Adjust until pass rate is acceptable (typically 85%+ for should-trigger, 90%+ for should-not-trigger).

8. **Apply**: Update SKILL.md frontmatter with the optimized description.

### Common Description Failures

| Failure Pattern | Root Cause | Fix |
|----------------|-----------|-----|
| "I want to build a chart" doesn't trigger data-viz skill | Description only mentions "graphs" and "plots" | Add "charts", "visualizations", "dashboards" |
| "Deploy my app" triggers docker skill | Description too broad — matches any "deploy" | Add "Docker containers only", exclude "Vercel, Netlify, direct server" |
| "Fix my endpoints" doesn't trigger API skill | Too casual — description uses formal terms | Add "endpoints", "routes", "API calls", "HTTP handlers" |

---

## 7. Common Skill Archetypes

### Archetype 1: Code Reviewer / Enforcer
**Examples**: ui-ux, api-design, lint-rules, security-audit
**Pattern**: Define rules → provide fixes → include scanner script → checklist
**Key files**: SKILL.md (principles + checklist), reference.md (specs), scripts/check.ps1

### Archetype 2: Generator / Scaffolder
**Examples**: project-init, component-generator, migration-writer
**Pattern**: Gather inputs → validate → generate output → verify
**Key files**: SKILL.md (workflow + output format), scripts/generate.ps1, assets/template/

### Archetype 3: Domain Expert
**Examples**: postgres-expert, aws-architect, react-patterns
**Pattern**: Knowledge areas → patterns table → anti-patterns → recommendations
**Key files**: SKILL.md (knowledge areas + patterns), reference.md (extended details)

### Archetype 4: Multi-Step Workflow
**Examples**: deploy-workflow, release-process, onboarding-guide
**Pattern**: Phases → safety checks → rollback plan → verification
**Key files**: SKILL.md (phases + checks), scripts/ for each phase

### Archetype 5: File Transformer
**Examples**: image-optimizer, csv-to-json, docx-generator
**Pattern**: Input format → transformation rules → output format → validation
**Key files**: SKILL.md (rules + format), scripts/transform.ps1

### Archetype 6: Meta / Tool
**Examples**: skill-creator (this skill), skill-validator, config-generator
**Pattern**: Process guide → templates → validation → self-improvement loop
**Key files**: SKILL.md (process + anti-patterns), reference.md (schemas + methodology), scripts/

---

## 8. Skill Structure Validation Rules

### Required Checks

```
✅ .opencode/skills/<name>/ directory exists
✅ SKILL.md exists in the directory
✅ SKILL.md has YAML frontmatter (starts with ---)
✅ Frontmatter contains `name` field
✅ Frontmatter contains `description` field
✅ `name` value matches the directory name
✅ `name` is lowercase alphanumeric with single hyphens (^[a-z0-9]+(-[a-z0-9]+)*$)
✅ `name` is 1–64 characters
✅ `name` doesn't start or end with hyphen
✅ `name` doesn't contain consecutive hyphens (--)
✅ `description` is 1–1024 characters
✅ SKILL.md body is under 500 lines (warning if exceeded)
✅ reference.md has table of contents if >300 lines (warning if missing)
✅ Scripts in scripts/ have .ps1 extension (Windows/PowerShell)
✅ Scripts are executable/readable
```

### Optional Checks (Warnings)

```
⚠️  SKILL.md has a Review Checklist section
⚠️  SKILL.md has Supporting Files section with clear pointers
⚠️  Description is 50–300 characters (optimal range)
⚠️  Description includes trigger phrases ("Use when...", "also use when...")
⚠️  No ALL-CAPS words except in code examples
⚠️  Examples use Input:/Output: format
⚠️  reference.md doesn't duplicate SKILL.md content
⚠️  No hardcoded secrets or paths in scripts
```

### Run Validation

```powershell
.\scripts\validate-skill.ps1 -Path .opencode\skills\<name>
```
