# validate-skill.ps1
# Validate a skill directory against structure and content rules.
# Usage: .\validate-skill.ps1 -Path <skill-directory> [-Strict]
#   -Path   : Path to skill directory (e.g., .opencode\skills\my-skill)
#   -Strict : Treat warnings as errors (for CI)

param(
    [Parameter(Mandatory=$true)]
    [string]$Path,

    [switch]$Strict
)

$ErrorActionPreference = "Stop"
$errors = 0
$warnings = 0

Write-Host "`n=== Skill Validator ===`n" -ForegroundColor Cyan
Write-Host "Validating: $Path`n"

# --- Check 1: Directory exists ---
if (-not (Test-Path $Path -PathType Container)) {
    Write-Host "[ERROR] Directory does not exist: $Path" -ForegroundColor Red
    exit 1
}

$skillName = Split-Path $Path -Leaf

# --- Check 2: SKILL.md exists ---
$skillFile = Join-Path $Path "SKILL.md"
if (-not (Test-Path $skillFile)) {
    Write-Host "[ERROR] Missing SKILL.md in $Path" -ForegroundColor Red
    $errors++
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "Validation failed with $errors error(s)." -ForegroundColor Red
    exit 1
}

$content = Get-Content -Path $skillFile -Raw -ErrorAction Stop

# --- Check 3: Has frontmatter (starts with ---) ---
if ($content -notmatch '^\s*---') {
    Write-Host "[ERROR] SKILL.md missing YAML frontmatter (must start with ---)" -ForegroundColor Red
    $errors++
} else {
    Write-Host "[PASS]  Has YAML frontmatter" -ForegroundColor Green
}

# Extract frontmatter
if ($content -match '^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n') {
    $frontmatter = $Matches[1]
} else {
    $frontmatter = ""
}

# --- Check 4: name field ---
if ($frontmatter -match 'name\s*:\s*(.+)') {
    $nameValue = $Matches[1].Trim()
    Write-Host "[PASS]  name: $nameValue" -ForegroundColor Green

    # Validate name format
    if ($nameValue -notmatch '^[a-z0-9]+(-[a-z0-9]+)*$') {
        Write-Host "[ERROR] name '$nameValue' must be lowercase alphanumeric with single hyphens" -ForegroundColor Red
        Write-Host "        Pattern: ^[a-z0-9]+(-[a-z0-9]+)*$" -ForegroundColor Red
        $errors++
    }
    if ($nameValue.Length -lt 1 -or $nameValue.Length -gt 64) {
        Write-Host "[ERROR] name must be 1-64 characters (got $($nameValue.Length))" -ForegroundColor Red
        $errors++
    }
    if ($nameValue -match '--') {
        Write-Host "[ERROR] name must not contain consecutive hyphens" -ForegroundColor Red
        $errors++
    }
    if ($nameValue -match '^-|-$') {
        Write-Host "[ERROR] name must not start or end with a hyphen" -ForegroundColor Red
        $errors++
    }

    # Check name matches directory
    if ($nameValue -ne $skillName) {
        Write-Host "[ERROR] name '$nameValue' does not match directory '$skillName'" -ForegroundColor Red
        $errors++
    } else {
        Write-Host "[PASS]  name matches directory" -ForegroundColor Green
    }
} else {
    Write-Host "[ERROR] Missing required 'name' field in frontmatter" -ForegroundColor Red
    $errors++
}

# --- Check 5: description field ---
if ($frontmatter -match 'description\s*:\s*(.+)') {
    $descValue = $Matches[1].Trim()
    $descLen = $descValue.Length
    Write-Host "[PASS]  description: $descLen chars" -ForegroundColor Green

    if ($descLen -lt 1) {
        Write-Host "[ERROR] description must not be empty" -ForegroundColor Red
        $errors++
    }
    if ($descLen -gt 1024) {
        Write-Host "[ERROR] description must be <= 1024 characters (got $descLen)" -ForegroundColor Red
        $errors++
    }
    if ($descLen -lt 50) {
        Write-Host "[WARN]  description is short (< 50 chars). Consider adding trigger contexts." -ForegroundColor Yellow
        $warnings++
    }
    if ($descLen -gt 300) {
        Write-Host "[WARN]  description is long (> 300 chars). Ensure it's scannable." -ForegroundColor Yellow
        $warnings++
    }
    if ($descValue -notmatch 'use when|trigger|when building|when creating|when working') {
        Write-Host "[WARN]  description may lack trigger phrases. Consider adding 'Use when...'." -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "[ERROR] Missing required 'description' field in frontmatter" -ForegroundColor Red
    $errors++
}

# --- Check 6: SKILL.md body length ---
$lines = ($content -split "`n").Count
if ($lines -gt 500) {
    Write-Host "[WARN]  SKILL.md is $lines lines (> 500). Consider splitting into reference.md." -ForegroundColor Yellow
    $warnings++
} else {
    Write-Host "[PASS]  SKILL.md: $lines lines (under 500 limit)" -ForegroundColor Green
}

# --- Check 7: Has review checklist ---
if ($content -match 'Review Checklist|Review checklist') {
    Write-Host "[PASS]  Has review checklist section" -ForegroundColor Green
} else {
    Write-Host "[WARN]  No 'Review Checklist' section found. Consider adding one." -ForegroundColor Yellow
    $warnings++
}

# --- Check 8: Has supporting files section ---
if ($content -match 'Supporting Files') {
    Write-Host "[PASS]  Has supporting files section" -ForegroundColor Green
} else {
    Write-Host "[WARN]  No 'Supporting Files' section. Add pointers to bundled resources." -ForegroundColor Yellow
    $warnings++
}

# --- Check 9: Excessive ALL-CAPS (outside code blocks) ---
# Remove code blocks first
$textOnly = $content -replace '```[\s\S]*?```', ''
$capsWords = [regex]::Matches($textOnly, '\b[A-Z]{3,}\b')
if ($capsWords.Count -gt 5) {
    Write-Host "[WARN]  $($capsWords.Count) ALL-CAPS words found (outside code). Prefer explaining 'why' over MUST/ALWAYS/NEVER." -ForegroundColor Yellow
    $warnings++
}

# --- Check 10: reference.md ---
$refFile = Join-Path $Path "reference.md"
if (Test-Path $refFile) {
    $refContent = Get-Content -Path $refFile -Raw -ErrorAction Stop
    $refLines = ($refContent -split "`n").Count
    Write-Host "[PASS]  reference.md exists: $refLines lines" -ForegroundColor Green

    if ($refLines -gt 300) {
        if ($refContent -notmatch 'Table of Contents') {
            Write-Host "[WARN]  reference.md ($refLines lines) has no Table of Contents" -ForegroundColor Yellow
            $warnings++
        }
    }

    # Check for duplicated SKILL.md content
    $skillBody = $content -replace '^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n', ''
    if ($skillBody.Length -gt 0) {
        $headingPatterns = [regex]::Matches($skillBody, '^###?\s+(.+)$', [System.Text.RegularExpressions.RegexOptions]::Multiline)
        foreach ($h in $headingPatterns) {
            $heading = $h.Groups[1].Value
            if ($heading.Length -gt 10 -and $refContent -match [regex]::Escape($heading.Trim())) {
                Write-Host "[WARN]  reference.md may duplicate content from SKILL.md: '$heading'" -ForegroundColor Yellow
                $warnings++
                break
            }
        }
    }
} else {
    Write-Host "[INFO]  No reference.md found (optional)" -ForegroundColor Gray
}

# --- Check 11: scripts/ directory ---
$scriptsDir = Join-Path $Path "scripts"
if (Test-Path $scriptsDir) {
    $scriptFiles = Get-ChildItem -Path $scriptsDir -File -ErrorAction SilentlyContinue
    if ($scriptFiles.Count -eq 0) {
        Write-Host "[WARN]  scripts/ directory exists but is empty" -ForegroundColor Yellow
        $warnings++
    } else {
        foreach ($sf in $scriptFiles) {
            if ($sf.Extension -ne ".ps1") {
                Write-Host "[WARN]  Non-PowerShell script: $($sf.Name). Consider .ps1 for Windows compatibility." -ForegroundColor Yellow
                $warnings++
            }
        }
        Write-Host "[PASS]  scripts/ contains $($scriptFiles.Count) file(s)" -ForegroundColor Green
    }
} else {
    Write-Host "[INFO]  No scripts/ directory (optional)" -ForegroundColor Gray
}

# --- Check 12: references/ directory ---
$referencesDir = Join-Path $Path "references"
if (Test-Path $referencesDir) {
    $refFiles = Get-ChildItem -Path $referencesDir -File -ErrorAction SilentlyContinue
    if ($refFiles.Count -gt 0) {
        Write-Host "[PASS]  references/ contains $($refFiles.Count) file(s)" -ForegroundColor Green
    } else {
        Write-Host "[WARN]  references/ directory exists but is empty" -ForegroundColor Yellow
        $warnings++
    }
}

# --- Check 13: assets/ directory ---
$assetsDir = Join-Path $Path "assets"
if (Test-Path $assetsDir) {
    Write-Host "[INFO]  assets/ directory present" -ForegroundColor Gray
}

# --- Check 14: No hardcoded secrets ---
if ($content -match '(?:API_KEY|SECRET|PASSWORD|TOKEN)\s*:\s*[\w+/=]{20,}') {
    Write-Host "[ERROR] Possible hardcoded secret in SKILL.md" -ForegroundColor Red
    $errors++
}

# --- Check 15: Has examples ---
if ($content -match '\*\*Input:?\*\*|\*\*Example' -or $content -match '```\w*\n[\s\S]{20,}\n```') {
    Write-Host "[PASS]  Contains examples or code samples" -ForegroundColor Green
} else {
    Write-Host "[WARN]  No examples found. Consider adding Input/Output examples." -ForegroundColor Yellow
    $warnings++
}

# --- Summary ---
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Validation complete: $($skillName)" -ForegroundColor Cyan
Write-Host "  Errors  : $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host "  Warnings: $warnings" -ForegroundColor $(if ($warnings -gt 0) { "Yellow" } else { "Green" })
Write-Host "=================================`n" -ForegroundColor Cyan

if ($Strict) {
    $total = $errors + $warnings
} else {
    $total = $errors
}

if ($total -gt 0) {
    if ($errors -gt 0) {
        Write-Host "Fix $errors error(s) before committing." -ForegroundColor Red
    }
    if (-not $Strict -and $warnings -gt 0) {
        Write-Host "Run with -Strict to treat $warnings warning(s) as errors (for CI)." -ForegroundColor Yellow
    }
    exit 1
}

Write-Host "All checks passed!" -ForegroundColor Green
exit 0
