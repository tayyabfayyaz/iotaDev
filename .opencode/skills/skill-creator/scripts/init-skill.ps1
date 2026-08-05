# init-skill.ps1
# Generate a complete skill directory structure from a name and description.
# Usage: .\init-skill.ps1 -Name <name> -Description "<desc>" [-Target <path>]
#   -Name        : Skill name (lowercase-hyphen, e.g. "my-skill")
#   -Description : Description for frontmatter (1-1024 chars)
#   -Target      : Output directory (default: .opencode\skills\ in current dir)
#   -WithRef     : Also create reference.md (default: true)
#   -WithScripts : Also create scripts/ directory (default: false)
#   -Archetype   : Skill archetype: enforcer|workflow|expert|generator (default: enforcer)
#   -Audience    : frontend|backend|all (default: all)
#   -Discipline  : Category label (default: general)

param(
    [Parameter(Mandatory=$true)]
    [string]$Name,

    [Parameter(Mandatory=$true)]
    [string]$Description,

    [string]$Target = ".opencode\skills",

    [switch]$WithRef = $true,

    [switch]$WithScripts = $false,

    [ValidateSet("enforcer", "workflow", "expert", "generator")]
    [string]$Archetype = "enforcer",

    [ValidateSet("frontend", "backend", "all")]
    [string]$Audience = "all",

    [string]$Discipline = "general"
)

$ErrorActionPreference = "Stop"

# --- Validate name ---
if ($Name -notmatch '^[a-z0-9]+(-[a-z0-9]+)*$') {
    Write-Host "ERROR: Name must be lowercase alphanumeric with single hyphens." -ForegroundColor Red
    Write-Host "  Valid: my-skill, api-design, skill-creator" -ForegroundColor Red
    Write-Host "  Invalid: MySkill, my_skill, --name--, -name-" -ForegroundColor Red
    exit 1
}
if ($Name.Length -lt 1 -or $Name.Length -gt 64) {
    Write-Host "ERROR: Name must be 1-64 characters. Got: $($Name.Length)" -ForegroundColor Red
    exit 1
}
if ($Description.Length -lt 1 -or $Description.Length -gt 1024) {
    Write-Host "ERROR: Description must be 1-1024 characters. Got: $($Description.Length)" -ForegroundColor Red
    exit 1
}

# --- Create directories ---
$skillDir = Join-Path $Target $Name
if (Test-Path $skillDir) {
    Write-Host "ERROR: Skill directory already exists: $skillDir" -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Path $skillDir -Force | Out-Null
Write-Host "Creating skill: $Name" -ForegroundColor Cyan

if ($WithScripts) {
    New-Item -ItemType Directory -Path (Join-Path $skillDir "scripts") -Force | Out-Null
}

# --- Generate SKILL.md ---
$archetypeContent = switch ($Archetype) {
    "enforcer" {
@"

## What I do

I enforce a set of non-negotiable rules for <domain>. I review code for violations, suggest fixes, and provide concrete examples.

## When to use me

Use me when:
- Building or editing <type> components/files
- Reviewing <type> code
- Implementing <activity>
- Auditing an existing <type> for issues

## Core Principles

### 1. <Principle Name>
- Concrete rule with specific values
- What to do and what to avoid

### 2. <Principle Name>
- Another rule with measurable criteria

## Review Checklist

When reviewing any <type>, verify in this order:

1. [ ] Check 1
2. [ ] Check 2
3. [ ] Check 3
"@
    }
    "workflow" {
@"

## What I do

Step-by-step workflow for <process name>. I guide through each phase and verify completion.

## When to use me

Use me when:
- User wants to <action>
- User mentions <keywords>
- Context involves <scenario>

## Workflow

### Phase 1: <Phase Name>
1. Step with specific instruction
2. Step with specific instruction
3. Verify: <what to check>

### Phase 2: <Phase Name>
1. Step with specific instruction
2. Step with specific instruction
3. Verify: <what to check>

## Safety Checks
Before proceeding, verify:
1. [ ] Precondition is met
2. [ ] Required tools are available
"@
    }
    "expert" {
@"

## What I do

Provide expert guidance and recommendations for <domain>. I draw on established patterns and best practices.

## When to use me

Use me when:
- User asks about <topic>, <topic>, or <topic>
- User needs guidance on <decision>
- Context involves <scenario>

## Knowledge Areas

### <Area 1>
Key facts, patterns, and recommendations.

### <Area 2>
More specialized knowledge.

## Common Patterns

| Scenario | Recommendation | Rationale |
|----------|---------------|-----------|
| ... | ... | ... |

## Anti-Patterns

| Pattern | Why It Fails | Alternative |
|---------|-------------|-------------|
| ... | ... | ... |
"@
    }
    "generator" {
@"

## What I do

Generate <output type> from <input type>. I follow templates and conventions to produce consistent output.

## When to use me

Use me when:
- User wants to create/generate <thing>
- User mentions <keywords>

## Input Requirements
Before generating, I need:
1. Requirement 1
2. Requirement 2

## Output Format
```
<exact template or structure>
```

## Generation Rules
1. Rule with reasoning
2. Rule with reasoning

## Examples
**Input:** <example input>
**Output:** <example output>
"@
    }
}

$skillContent = @"
---
name: $Name
description: $Description
metadata:
  audience: $Audience
  discipline: $Discipline
---

$archetypeContent

## Supporting Files

- `reference.md` — detailed technical reference with specifications, patterns, and testing methods
"@

if ($WithScripts) {
    $skillContent += @"

- `scripts/` — executable helper scripts
"@
}

$skillContent += @"

Read `reference.md` when detailed specifications or code examples are needed. Use the Review Checklist after every change to self-verify.
"@

Set-Content -Path (Join-Path $skillDir "SKILL.md") -Value $skillContent -Encoding UTF8
Write-Host "  Created: SKILL.md" -ForegroundColor Green

# --- Generate reference.md ---
if ($WithRef) {
    $refContent = @"
# $Name — Technical Reference

Detailed specifications, patterns, and examples.

---

## Table of Contents

1. [Section 1](#1-section-1)
2. [Section 2](#2-section-2)
3. [Anti-Patterns](#3-anti-patterns)

---

## 1. Section 1

Add detailed content here. Use code blocks for examples:

``````python
# Example code
def example():
    pass
``````

## 2. Section 2

Add more detailed content here. Use tables for reference data:

| Item | Value | Notes |
|------|-------|-------|
| ... | ... | ... |

---

## 3. Anti-Patterns

| Anti-Pattern | Why It's Bad | Fix |
|-------------|-------------|-----|
| Thing to avoid | Explanation | Better approach |
| Another mistake | Its consequences | Correct pattern |

---

## Testing Methods

### Automated
| Tool | What It Checks | When |
|------|---------------|------|
| ... | ... | ... |

### Manual
1. Step 1
2. Step 2
"@
    Set-Content -Path (Join-Path $skillDir "reference.md") -Value $refContent -Encoding UTF8
    Write-Host "  Created: reference.md" -ForegroundColor Green
}

# --- Generate placeholder script ---
if ($WithScripts) {
    $scriptContent = @"
# script-name.ps1
# Purpose: <one-line description>
# Usage: .\script-name.ps1 [-Param <value>]
#   -Param : Description (default: value)

param(
    [string]`$Param = "default"
)

`$ErrorActionPreference = "Stop"

Write-Host "Script running..." -ForegroundColor Cyan

# TODO: Add logic here

Write-Host "Done." -ForegroundColor Green
"@
    Set-Content -Path (Join-Path (Join-Path $skillDir "scripts") "script-name.ps1") -Value $scriptContent -Encoding UTF8
    Write-Host "  Created: scripts/script-name.ps1" -ForegroundColor Green
}

# --- Summary ---
Write-Host ""
Write-Host "Skill '$Name' created at: $skillDir" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Edit SKILL.md — fill in the templated sections" -ForegroundColor White
Write-Host "  2. Edit reference.md — add detailed specifications" -ForegroundColor White
Write-Host "  3. Run validate-skill.ps1 to verify structure" -ForegroundColor White
Write-Host "  4. Test the skill with realistic prompts" -ForegroundColor White
