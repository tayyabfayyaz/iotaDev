---
name: skill-creator
description: Create new skills, modify and improve existing skills, and measure skill performance for OpenCode agents. Use when users want to create a skill from scratch, edit or optimize an existing skill, run test cases to verify a skill, benchmark skill performance, or optimize a skill's description for better triggering accuracy. Also trigger when users mention "skill creation", "write a skill", "improve this skill", "create an agent skill", "fix my skill", or "should this be a skill?" — even if the user doesn't use the exact phrase "skill-creator".
metadata:
  audience: all
  discipline: agent-engineering
---

# Skill Creator

A skill for creating, testing, and iteratively improving OpenCode agent skills.

## The Core Process

At a high level, creating a skill follows this loop:

1. **Capture intent** — understand what the skill should do and when it should fire
2. **Interview & research** — ask clarifying questions, check available tools, research conventions
3. **Write a draft** — produce the SKILL.md and supporting files
4. **Test** — run realistic prompts with and without the skill active
5. **Evaluate** — review outputs qualitatively; grade assertions if applicable
6. **Improve** — revise based on feedback, generalize from specific failures
7. **Repeat** — iterate until the user is satisfied

Your job is to figure out where the user is in this process and jump in. They might say "I want a skill for X" (start at step 1) or "fix my skill, it's not triggering" (jump to step 4–6).

---

## Step 1: Capture Intent

Start by understanding what the user wants. If the conversation already contains a workflow they want to capture (e.g., "turn this into a skill"), extract answers from history first.

Ask the essential questions (keep it brief — don't overwhelm):

1. **What should this skill enable the agent to do?**
2. **When should this skill trigger?** (what user phrases, topics, or contexts)
3. **What's the expected output?** (code, files, research, advice)
4. **Should we set up test cases?** Skills with objectively verifiable outputs (file transforms, data extraction, code generation, fixed workflow steps) benefit from test cases. Skills with subjective outputs (writing style, design advice) often don't need them. Suggest the appropriate default but let the user decide.

## Step 2: Interview & Research

Proactively ask about:
- Edge cases the skill should handle
- Input/output formats and example files
- Dependencies (languages, frameworks, tools)
- Whether the skill checks files or just provides guidance
- Success criteria — how will the user know the skill works?

Research in parallel if useful: check existing skills in the project, look up conventions in the codebase, consult relevant documentation.

## Step 3: Write the SKILL.md

Based on the interview, fill in these components:

### Frontmatter (Required)

- **`name`**: lowercase alphanumeric with single hyphens; must match the directory name
- **`description`**: this is the PRIMARY triggering mechanism. Include BOTH what the skill does AND when to use it. Be "pushy" — explicitly tell the agent to use this skill whenever certain topics or phrasing come up, even if the user doesn't use the exact keyword. Example: instead of "Builds dashboards", write "Builds dashboards to display internal data. Use whenever the user mentions dashboards, data visualization, internal metrics, or wants to display any kind of company data — even if they don't explicitly say 'dashboard.'"

The description field is the ONLY thing the agent reads to decide whether to load the skill. If your description is too narrow, the skill won't fire when needed. If too broad, it'll fire on irrelevant prompts. Tune this deliberately.

### SKILL.md Body (Required)

Structure the body with clear headings:

```markdown
## What I do
Brief (2-4 sentence) summary of capabilities.

## When to use me
Specific triggers, contexts, and user phrases that should activate this skill.
Include near-miss cases: "even if the user says X but means Y."

## Core Principles / Instructions
Numbered principles with concrete rules. Prefer explaining *why* over heavy-handed MUSTs.
Use the imperative form. Include examples where helpful.

## Review Checklist
A checklist the agent can use to verify its own work.

## Supporting Files
Pointers to reference.md, scripts/, assets/ — with guidance on when to read/run them.
```

**Progressive disclosure**: The agent sees this content in stages:
1. **Metadata** (name + description) — always in context (~100 words)
2. **SKILL.md body** — loaded when the skill triggers (<500 lines ideal)
3. **Bundled resources** — loaded on demand (references/, scripts/, assets/)

Keep SKILL.md under 500 lines. If you're approaching that limit, move detailed material to `reference.md` and add clear pointers.

### Bundled Resources (Optional)

```
skill-name/
├── SKILL.md (required)
├── reference.md        — Detailed docs loaded on demand
├── references/         — Multiple domain-specific reference files
│   ├── aws.md
│   └── gcp.md
├── scripts/            — Executable, deterministic code
│   └── validate.ps1
└── assets/             — Templates, icons, fonts used in output
    └── template.html
```

**Key patterns:**
- **scripts/**: For REPETITIVE, DETERMINISTIC tasks. If the agent would write the same script every time, bundle it. Put it in the skill and tell the skill to use it.
- **references/**: For large documentation that the agent should consult on demand. Include a table of contents at the top for files >300 lines. When a skill supports multiple domains, organize by variant so the agent reads only the relevant file.
- **assets/**: For files used in final output — templates, starter code, icons, fonts. Not for documentation.

## Step 4: Test

Create 2–3 realistic test prompts — the kind of thing a real user would say to trigger this skill.

**Good test prompts:**
- Contain realistic detail (file paths, personal context, column names, company names)
- Mix formal and casual language
- Include near-miss cases (should this trigger or not?)
- Are concrete and specific, not abstract

**Bad test prompts:**
- "Format this data" (too abstract)
- "Use the skill" (circular)
- "Extract text from PDF" (too generic, no context)

Run each test with the skill active. For objectively verifiable skills, also run a baseline (without the skill) to compare. Ask the user: "Here are test cases I'd like to try. Do these look right, or should we add more?"

## Step 5: Evaluate

Present results to the user. For each test case, show:
- The prompt that was used
- The output with the skill active
- If applicable, the baseline output (without the skill)
- Any quantitative assertions and whether they passed

Ask the user for feedback on each output. For skills with quantitative benchmarks, also present aggregate stats.

## Step 6: Improve

Based on feedback, revise the skill. Focus on:

1. **Generalize from feedback.** Don't overfit to the test cases — the skill must work for thousands of unseen prompts. Rather than rigid MUSTs, reframe with understanding. If a stubborn issue persists, try different metaphors or patterns.

2. **Keep the prompt lean.** Remove things that aren't pulling their weight. Read the transcripts — if the skill wastes time on unproductive steps, cut those instructions.

3. **Explain the why.** Today's LLMs are smart — they have good theory of mind. Instead of ALWAYS/NEVER in all caps, explain *why* each instruction matters. The agent will go beyond rote instructions when it understands the reasoning.

4. **Look for repeated work across test cases.** If all test runs independently wrote the same helper script or took the same multi-step approach, bundle that work. Write the script once, put it in `scripts/`, and tell the skill to use it.

5. **Leverage existing patterns.** Check what other skills in `.opencode/skills/` do well and borrow their conventions.

## Step 7: Optimize Description

The description in frontmatter is the PRIMARY trigger mechanism. After the skill is functionally correct, optimize the description so it fires at the right times (and not on irrelevant prompts).

### How Skill Triggering Works

Skills appear in the agent's `<available_skills>` list with their name and description. The agent decides whether to load a skill based solely on that description. The agent tends to **under-trigger** — it won't load a skill unless clearly needed. Combat this by making descriptions slightly pushy.

### Description Tuning

1. **Create trigger eval queries** — a mix of 10–15 prompts:
   - **Should-trigger** (60%): Different phrasings of the same intent. Some formal, some casual, some with typos. Include cases where the user doesn't explicitly name the skill but clearly needs it. Edge cases and uncommon uses.
   - **Should-not-trigger** (40%): Near-misses — queries that share keywords or concepts but need something different. Adjacent domains, ambiguous phrasing where a naive match would trigger but shouldn't.

2. **Review with user** — present the eval set. Make sure the user agrees on what should and shouldn't trigger.

3. **Test the description** — for each eval query, check whether the agent actually loads the skill. Adjust the description based on failures.

4. **Balance specificity**:
   - Too narrow → skill won't fire enough (missed opportunities)
   - Too broad → skill fires on irrelevant prompts (noise)
   - Just right → fires on intended topics, stays quiet otherwise

### Description Writing Tips

- **Front-load trigger words**: put important keywords early in the description
- **Use "pushy" language**: "Use when users mention X, Y, or Z — even if they don't use the exact term"
- **Cover near-synonyms**: if your skill helps with "dashboards", also mention "metrics", "charts", "visualizations", "reports"
- **Include context clues**: "Use when working with..." helps the agent match on environment, not just queries
- **Test edge cases**: casual language, typos, indirect references

## Writing Style & Tone

### Calibrate to the user

The skill-creator may be used by people ranging from non-technical to senior engineers. Pay attention to context cues in how the user talks:
- "evaluation" and "benchmark" are borderline-safe terms
- "JSON" and "assertion" should only be used without explanation if the user shows clear signals they understand them
- When in doubt, briefly define terms: "...assertions — automated checks that verify the output is correct"

### Writing the skill instructions

- **Prefer the imperative form**: "Do X", "Check Y", "Verify Z"
- **Explain why, not just what**: Instead of "ALWAYS use async def" → "Use `async def` for I/O-bound routes so the event loop stays free for other requests"
- **Include examples**: Show correct and incorrect patterns side by side
- **Use the checklist pattern**: End with a review checklist the agent can run through
- **Be general, not hyper-specific**: Write for the thousand future prompts, not just the 3 test cases

## Skill Anatomy (for OpenCode)

```
.opencode/skills/<skill-name>/
├── SKILL.md (required)
│   ├── YAML frontmatter: name, description (required), metadata (optional)
│   └── Markdown body: instructions, principles, checklist
├── reference.md           — Detailed technical reference (optional)
├── references/            — Domain-specific docs (optional)
├── scripts/               — Executable code (optional)
│   └── *.ps1              — PowerShell scripts (Windows-compatible)
└── assets/                — Output templates/icons (optional)
```

**Naming rules:**
- `name` field: lowercase alphanumeric, single hyphens, 1–64 chars, no leading/trailing hyphens, no consecutive hyphens
- Directory name must exactly match the `name` field
- Regex: `^[a-z0-9]+(-[a-z0-9]+)*$`

**Metadata recommendations:**
- `audience`: frontend / backend / all — helps organize skills
- `discipline`: design-engineering / api-engineering / agent-engineering / devops

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | Better Approach |
|-------------|-------------|-----------------|
| Description that just restates the name | No triggering info | Describe when AND why to use the skill |
| SKILL.md > 500 lines without reference.md | Exceeds context budget | Split into SKILL.md (core) + reference.md (details) |
| Too many ALL-CAPS MUSTS | Oppressive, demotivating | Explain reasoning, use theory of mind |
| Overfitting to test cases | Skill only works on known prompts | Write general principles, test on new prompts |
| No examples in instructions | Agent must guess at output format | Show input → output pairs |
| Scripts that duplicate what the agent could do once | Adds maintenance burden | Only bundle scripts for REPETITIVE tasks |
| Description too narrow | Skill won't trigger for valid use cases | Add near-synonyms and context clues |
| Description too broad | Skill fires on irrelevant prompts | Add counter-examples and scope boundaries |
| No review checklist | No self-verification | Always end with a checklist |
| Bare "except:" blocks in bundled scripts | Swallows errors, hard to debug | Catch specific exceptions, report meaningfully |

## Quick Reference: Creating a Skill from Scratch

1. Ask the 4 essential questions (what, when, output format, test cases?)
2. Interview on edge cases, dependencies, and success criteria
3. Draft SKILL.md with pushy description + structured body
4. Create supporting files (reference.md, scripts/) as needed
5. Run test prompts with and without the skill
6. Present results, collect feedback
7. Revise based on feedback — generalize, not overfit
8. Tune the description for correct triggering
9. Run the init script to verify structure compliance
10. Deliver the final skill to the user

## Supporting Files

- `reference.md` — detailed patterns for SKILL.md writing, description optimization methodology, eval schema reference, and skill structure templates
- `scripts/init-skill.ps1` — PowerShell script that generates a complete skill directory from a name and description
- `scripts/validate-skill.ps1` — PowerShell script that validates a skill directory against structure rules
