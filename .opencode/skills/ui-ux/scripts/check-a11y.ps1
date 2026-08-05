# check-a11y.ps1
# Scan codebase for common accessibility and UI/UX violations.
# Usage: .\check-a11y.ps1 [-Path <path>] [-Strict]
#   -Path   : Target directory (default: current directory)
#   -Strict : Treat warnings as errors (non-zero exit for CI)

param(
    [string]$Path = ".",
    [switch]$Strict
)

$ErrorActionPreference = "Stop"
$violations = 0
$warnings = 0
$files = @()

Write-Host "`n=== UI/UX Accessibility Scanner ===`n" -ForegroundColor Cyan

# ---- Collect source files ----
$extensions = @("*.tsx", "*.jsx", "*.css", "*.scss", "*.html")
foreach ($ext in $extensions) {
    $files += Get-ChildItem -Path $Path -Filter $ext -Recurse -File -ErrorAction SilentlyContinue
}
Write-Host "Scanning $($files.Count) files in $Path...`n"

# ---- Check patterns ----
$checks = @(
    @{
        Name = "outline:none without visible replacement"
        Pattern = 'outline\s*:\s*none'
        Severity = "error"
        Fix = "Replace with a visible :focus-visible style (e.g., box-shadow or custom outline)"
    },
    @{
        Name = "missing alt on <img> tag"
        Pattern = '<img(?![^>]*\salt\s*=)[^>]*>'
        Severity = "error"
        Fix = "Add alt='...' (meaningful description) or alt='' (for decorative images)"
    },
    @{
        Name = "placeholder used as label (input without associated label or aria-label)"
        Pattern = '<input(?![^>]*\s(?:aria-label|aria-labelledby)\s*=)[^>]*placeholder\s*='
        Severity = "warning"
        Fix = "Add a <label> element or aria-label attribute"
    },
    @{
        Name = "div with onClick but no role (should be <button>)"
        Pattern = '<div[^>]*onClick\s*='
        Severity = "error"
        Fix = "Use <button> instead of <div> for clickable elements"
    },
    @{
        Name = "color value that may fail contrast (light gray #aaa-#ddd range)"
        Pattern = 'color\s*:\s*#[a-cA-C][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]'
        Severity = "warning"
        Fix = "Verify contrast ratio >= 4.5:1 against background. Consider using a darker shade."
    },
    @{
        Name = "disabled zoom via maximum-scale"
        Pattern = 'maximum-scale\s*=\s*1'
        Severity = "error"
        Fix = "Remove maximum-scale=1 from viewport meta tag"
    },
    @{
        Name = "animation without prefers-reduced-motion guard"
        Pattern = '@keyframes\s+\w+'
        Severity = "warning"
        Fix = "Wrap animations in @media (prefers-reduced-motion: no-preference)"
    },
    @{
        Name = "pure white (#fff/#ffffff) on pure black (#000/#000000) or vice versa"
        Pattern = 'background(-color)?\s*:\s*#(?:fff|ffffff|000|000000)'
        Severity = "warning"
        Fix = "Use softer shades: #fafafa / #121212 instead of #fff / #000"
    },
    @{
        Name = "emoji used in button/label text (use real icons)"
        Pattern = '<(?:button|a)[^>]*>[^<]*[\x{1F300}-\x{1F9FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}]'
        Severity = "warning"
        Fix = "Replace emoji with SVG icon from Lucide/Heroicons/Phosphor"
    },
    @{
        Name = "fixed pixel width on container (use fluid units)"
        Pattern = '(?:max-)?width\s*:\s*\d{3,}px\s*;'
        Severity = "info"
        Fix = "Use rem, %, vw, clamp(), or min() for fluid layout"
    },
    @{
        Name = "tap target smaller than 44x44px"
        Pattern = '(?:min-)?(?:width|height)\s*:\s*(?:[1-3]\d|4[0-3])px\s*;\s*(?:min-)?(?:height|width)\s*:\s*(?:[1-3]\d|4[0-3])px'
        Severity = "warning"
        Fix = "Ensure interactive elements have min-width and min-height of 44px"
    },
    @{
        Name = "font-size smaller than 16px on body text"
        Pattern = 'font-size\s*:\s*(?:1[0-5]|[0-9])px'
        Severity = "warning"
        Fix = "Set body font-size to at least 16px (1rem)"
    },
    @{
        Name = "line-height below 1.5 on body text"
        Pattern = 'line-height\s*:\s*(?:1\.[0-4]|[01])\b'
        Severity = "warning"
        Fix = "Set body line-height to at least 1.5"
    },
    @{
        Name = "useState/useRef for query but no loading/error state"
        Pattern = '\.(?:get|post|put|delete|fetch)\s*\('
        Severity = "info"
        Fix = "Add isLoading and error states; never render blank while loading"
    }
)

# ---- Run checks ----
foreach ($check in $checks) {
    $matches = @()
    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -match $check.Pattern) {
            $matches += $file
        }
    }

    if ($matches.Count -gt 0) {
        $color = switch ($check.Severity) {
            "error" { "Red" }
            "warning" { "Yellow" }
            "info" { "Gray" }
        }

        Write-Host "[$($check.Severity.ToUpper())] $($check.Name)" -ForegroundColor $color
        Write-Host "  Fix: $($check.Fix)" -ForegroundColor $color
        Write-Host "  Found in $($matches.Count) file(s):" -ForegroundColor $color
        foreach ($m in $matches) {
            $relative = $m.FullName.Replace((Resolve-Path $Path).Path + "\", "")
            Write-Host "    - $relative"
        }
        Write-Host ""

        if ($check.Severity -eq "error") { $violations++ }
        if ($check.Severity -eq "warning") { $warnings++ }
    }
}

# ---- Additional structural checks ----
Write-Host "--- Structural Checks ---`n" -ForegroundColor Cyan

# Check for viewport meta in HTML files
$htmlFiles = Get-ChildItem -Path $Path -Filter "*.html" -Recurse -File -ErrorAction SilentlyContinue
foreach ($html in $htmlFiles) {
    $content = Get-Content -Path $html.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -notmatch 'width=device-width') {
        $relative = $html.FullName.Replace((Resolve-Path $Path).Path + "\", "")
        Write-Host "[WARNING] Missing viewport meta tag in: $relative" -ForegroundColor Yellow
        Write-Host "  Fix: Add <meta name='viewport' content='width=device-width, initial-scale=1'>`n"
        $warnings++
    }
}

# Check for images without explicit width/height (CLS prevention)
$tsxFiles = Get-ChildItem -Path $Path -Filter "*.tsx" -Recurse -File -ErrorAction SilentlyContinue
foreach ($tsx in $tsxFiles) {
    $content = Get-Content -Path $tsx.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match '<img(?![^>]*\swidth\s*=)[^>]*>') {
        $relative = $tsx.FullName.Replace((Resolve-Path $Path).Path + "\", "")
        Write-Host "[INFO] <img> without explicit width/height in: $relative" -ForegroundColor Gray
        Write-Host "  Fix: Add width and height attributes to prevent CLS`n"
    }
}

# ---- Summary ----
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Scan complete." -ForegroundColor Cyan
Write-Host "  Errors  : $violations" -ForegroundColor $(if ($violations -gt 0) { "Red" } else { "Green" })
Write-Host "  Warnings: $warnings" -ForegroundColor $(if ($warnings -gt 0) { "Yellow" } else { "Green" })
Write-Host "=================================`n" -ForegroundColor Cyan

$total = $violations + $(if ($Strict) { $warnings } else { 0 })
if ($total -gt 0) {
    Write-Host "Run with -Strict to treat warnings as errors (for CI)." -ForegroundColor Yellow
    exit 1
}

exit 0
