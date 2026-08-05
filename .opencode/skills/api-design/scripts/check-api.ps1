# check-api.ps1
# Scan a FastAPI codebase for API design violations.
# Usage: .\check-api.ps1 [-Path <path>] [-Strict]
#   -Path   : Target directory (default: current directory)
#   -Strict : Treat warnings as errors (for CI)

param(
    [string]$Path = ".",
    [switch]$Strict
)

$ErrorActionPreference = "Stop"
$violations = 0
$warnings = 0
$info = 0

Write-Host "`n=== FastAPI Endpoint & API Design Scanner ===`n" -ForegroundColor Cyan

# Collect Python files
$pyFiles = Get-ChildItem -Path $Path -Filter "*.py" -Recurse -File -ErrorAction SilentlyContinue
Write-Host "Scanning $($pyFiles.Count) Python files in $Path...`n"

# ---- Check 1: Verb in endpoint URL ----
Write-Host "--- Endpoint Naming Checks ---`n" -ForegroundColor Cyan
foreach ($file in $pyFiles) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    $relative = $file.FullName.Replace((Resolve-Path $Path).Path + "\", "")

    # Check for verbs in URL paths (GET /getX, POST /createX, etc.)
    $verbPatterns = @(
        '(?:@app\.|@router\.)(?:get|post|put|delete|patch)\s*\(\s*["''][^"''\n]*/(?:get|fetch|retrieve|create|make|update|delete|remove|save|load|send|do|set|put)[-_]',
        '(?:@app\.|@router\.)(?:get|post|put|delete|patch)\s*\(\s*["''][^"''\n]*/get[A-Z]',
        '(?:@app\.|@router\.)(?:get|post|put|delete|patch)\s*\(\s*["''][^"''\n]*/create[A-Z]',
        '(?:@app\.|@router\.)(?:get|post|put|delete|patch)\s*\(\s*["''][^"''\n]*/delete[A-Z]'
    )
    foreach ($pattern in $verbPatterns) {
        if ($content -match $pattern) {
            Write-Host "[WARNING] Verb in endpoint URL: $relative" -ForegroundColor Yellow
            Write-Host "  Fix: Use noun + HTTP method (e.g., GET /users, not GET /getUsers)`n"
            $warnings++
        }
    }

    # Check for underscores in endpoint paths (should be kebab-case)
    if ($content -match '(?:@app\.|@router\.)(?:get|post|put|delete|patch)\s*\(\s*["''][^"''\n]*/[\w-]*_[\w-]*["'']') {
        $matches_found = [regex]::Matches($content, '(?:@app\.|@router\.)(?:get|post|put|delete|patch)\s*\(\s*["'']([^"'']*_[\w-/]*)["'']')
        foreach ($m in $matches_found) {
            $path_found = $m.Groups[1].Value
            if ($path_found -match "_") {
                Write-Host "[WARNING] Underscore in endpoint path: $relative → $path_found" -ForegroundColor Yellow
                Write-Host "  Fix: Use kebab-case (e.g., /blog-posts, not /blog_posts)`n"
                $warnings++
                break
            }
        }
    }
}

# ---- Check 2: Error handling patterns ----
Write-Host "--- Error Handling Checks ---`n" -ForegroundColor Cyan
foreach ($file in $pyFiles) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    $relative = $file.FullName.Replace((Resolve-Path $Path).Path + "\", "")

    # Check for bare string in HTTPException detail
    $bareStrings = [regex]::Matches($content, 'HTTPException\s*\(\s*status_code\s*=\s*\d+,\s*detail\s*=\s*["'']([^}"'']+)["'']\s*\)')
    if ($bareStrings.Count -gt 0) {
        $hasBare = $false
        foreach ($m in $bareStrings) {
            $detailValue = $m.Groups[1].Value
            if ($detailValue -match "^\w") {
                $hasBare = $true
            }
        }
        if ($hasBare) {
            Write-Host "[INFO] String detail in HTTPException: $relative" -ForegroundColor Gray
            Write-Host "  Consider: Use structured detail dict with 'code' and 'message' keys`n"
            $info++
        }
    }

    # Check for plain except (no specific exception)
    if ($content -match '(?<!except\s+\w+Error)except\s*:') {
        Write-Host "[WARNING] Bare 'except:' found in: $relative" -ForegroundColor Yellow
        Write-Host "  Fix: Catch specific exceptions; always log and return a safe HTTPException`n"
        $warnings++
    }

    # Check for return without response_model on routes
    $routePattern = '(?:@app\.|@router\.)(get|post|put|delete|patch)\s*\(([^)]*)\)'
    $routeMatches = [regex]::Matches($content, $routePattern)
    foreach ($rm in $routeMatches) {
        $decoratorBody = $rm.Groups[2].Value
        if ($decoratorBody -notmatch 'response_model') {
            Write-Host "[INFO] Missing response_model on route in: $relative" -ForegroundColor Gray
            Write-Host "  Fix: Add response_model=YourPydanticModel to the decorator`n"
            $info++
            break
        }
    }
}

# ---- Check 3: Security patterns ----
Write-Host "--- Security Checks ---`n" -ForegroundColor Cyan
foreach ($file in $pyFiles) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    $relative = $file.FullName.Replace((Resolve-Path $Path).Path + "\", "")

    # Check for hardcoded secrets/keys
    $secretPatterns = @(
        'SECRET\s*=\s*["''][A-Za-z0-9+/=]{20,}["'']',
        'API_KEY\s*=\s*["''][A-Za-z0-9+/=]{20,}["'']',
        'PASSWORD\s*=\s*["''][^"''\s]{4,}["'']\s*(?!#|$)',
        'TOKEN\s*=\s*["''][A-Za-z0-9._-]{20,}["'']'
    )
    foreach ($pattern in $secretPatterns) {
        if ($content -match $pattern) {
            Write-Host "[ERROR] Hardcoded secret detected in: $relative" -ForegroundColor Red
            Write-Host "  Fix: Use os.getenv('KEY_NAME') and store value in .env (gitignored)`n"
            $violations++
        }
    }

    # Check for secure token comparison
    if ($content -match 'Bearer') {
        if ($content -match '==\s*\w+\s*\)' -and $content -match 'compare_digest') {
            # Good — using hmac.compare_digest
        } elseif ($content -match 'provided\s*==\s*ADMIN_KEY') {
            Write-Host "[WARNING] Token comparison using '==' (timing attack risk): $relative" -ForegroundColor Yellow
            Write-Host "  Fix: Use hmac.compare_digest(provided, ADMIN_KEY) for constant-time comparison`n"
            $warnings++
        }
    }

    # Check for CORS allow_origins with wildcard and credentials
    if (($content -match 'allow_origins\s*=\s*\[.*"\*".*\]' -or $content -match 'allow_origins\s*=\s*\[[\s\n]*"\*"[\s\n]*\]') -and
        $content -match 'allow_credentials\s*=\s*True') {
        Write-Host "[ERROR] CORS wildcard origin with credentials: $relative" -ForegroundColor Red
        Write-Host "  Fix: Replace '*' with specific origins list`n"
        $violations++
    }
}

# ---- Check 4: Status code usage ----
Write-Host "--- Status Code Checks ---`n" -ForegroundColor Cyan
foreach ($file in $pyFiles) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    $relative = $file.FullName.Replace((Resolve-Path $Path).Path + "\", "")

    # Check for DELETE without 204
    $deleteRoutes = [regex]::Matches($content, '@app\.delete\s*\(([^)]*\))\s*\n(?:\s*async\s+)?def\s+(\w+)')
    foreach ($dr in $deleteRoutes) {
        $funcName = $dr.Groups[2].Value
        # Check if the route uses status_code=204
        $decoratorLines = $dr.Groups[1].Value
        if ($decoratorLines -notmatch 'status_code') {
            Write-Host "[INFO] DELETE route '$funcName' without explicit status_code=204: $relative" -ForegroundColor Gray
            Write-Host "  Consider: Add status_code=status.HTTP_204_NO_CONTENT`n"
            $info++
        }
    }

    # Check for POST without 201
    $postRoutes = [regex]::Matches($content, '@app\.post\s*\(([^)]*\))\s*\n(?:\s*async\s+)?def\s+(\w+)')
    foreach ($pr in $postRoutes) {
        $funcName = $pr.Groups[2].Value
        $decoratorLines = $pr.Groups[1].Value
        if ($decoratorLines -notmatch 'status_code') {
            Write-Host "[INFO] POST route '$funcName' without explicit status_code=201: $relative" -ForegroundColor Gray
            Write-Host "  Consider: Add status_code=status.HTTP_201_CREATED`n"
            $info++
        }
    }

    # Check for 200 OK on error paths (anti-pattern)
    if ($content -match 'return\s+\{[^}]*"error"' -and $content -notmatch 'status_code') {
        Write-Host "[WARNING] Possible error returned with 200 OK: $relative" -ForegroundColor Yellow
        Write-Host "  Fix: Use raise HTTPException(status_code=4xx/5xx) instead of returning errors with 200`n"
        $warnings++
    }
}

# ---- Check 5: Async/sync consistency ----
Write-Host "--- Async/Sync Consistency Checks ---`n" -ForegroundColor Cyan
foreach ($file in $pyFiles) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    $relative = $file.FullName.Replace((Resolve-Path $Path).Path + "\", "")

    # Check for time.sleep in async function
    if ($content -match 'async\s+def\s+\w+') {
        $asyncFuncs = [regex]::Matches($content, 'async\s+def\s+(\w+)\s*\([^)]*\):\s*\n((?:\s+.*\n?)*?)(?=\n(?:async\s+def|def\s+|@|class\s+|\Z))')
        foreach ($af in $asyncFuncs) {
            $funcBody = $af.Groups[2].Value
            if ($funcBody -match 'time\.sleep\(') {
                Write-Host "[ERROR] time.sleep() in async function '${af.Groups[1].Value}': $relative" -ForegroundColor Red
                Write-Host "  Fix: Use 'await asyncio.sleep()' or move to sync def`n"
                $violations++
            }
            if ($funcBody -match 'requests\.(get|post|put|delete|patch)\(') {
                Write-Host "[WARNING] Blocking requests call in async function '${af.Groups[1].Value}': $relative" -ForegroundColor Yellow
                Write-Host "  Fix: Use httpx.AsyncClient or run_in_threadpool`n"
                $warnings++
            }
        }
    }
}

# ---- Check 6: Pydantic model conventions ----
Write-Host "--- Pydantic Model Checks ---`n" -ForegroundColor Cyan
foreach ($file in $pyFiles) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    $relative = $file.FullName.Replace((Resolve-Path $Path).Path + "\", "")

    # Check for models used as both input and output
    $models = [regex]::Matches($content, 'class\s+(\w+)\s*\(\s*BaseModel\s*\)')
    $modelNames = @{}
    foreach ($m in $models) {
        $modelNames[$m.Groups[1].Value] = $true
    }

    # Models reused as both response_model and request body
    foreach ($name in $modelNames.Keys) {
        $asResponse = $content -match "response_model\s*=\s*$name\b"
        $asInput = $content -match "(?::\s*$name\b|$name\s*=\s*Depends)"
        if ($asResponse -and $asInput) {
            Write-Host "[WARNING] Model '$name' used as both input and response_model: $relative" -ForegroundColor Yellow
            Write-Host "  Fix: Create separate ${name}Create and ${name}Response models`n"
            $warnings++
        }
    }
}

# ---- Check 7: Missing tags, summary, description ----
Write-Host "--- OpenAPI Documentation Checks ---`n" -ForegroundColor Cyan
foreach ($file in $pyFiles) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    $relative = $file.FullName.Replace((Resolve-Path $Path).Path + "\", "")

    $routeLines = [regex]::Matches($content, '@(app|router)\.(get|post|put|delete|patch)\s*\(([^)]*)\)')
    foreach ($rl in $routeLines) {
        $decorator = $rl.Groups[3].Value
        $hasTags = $decorator -match 'tags\s*='
        $hasSummary = $decorator -match 'summary\s*='
        $hasDescription = $decorator -match 'description\s*='

        if (-not $hasTags -and $decorator -match '["'']\s*/api/') {
            Write-Host "[INFO] Route missing 'tags' (Swagger grouping): $decorator" -ForegroundColor Gray
            $info++
            break
        }
    }
}

# ---- Summary ----
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Scan complete." -ForegroundColor Cyan
Write-Host "  Errors  : $violations" -ForegroundColor $(if ($violations -gt 0) { "Red" } else { "Green" })
Write-Host "  Warnings: $warnings" -ForegroundColor $(if ($warnings -gt 0) { "Yellow" } else { "Green" })
Write-Host "  Info    : $info" -ForegroundColor $(if ($info -gt 0) { "Gray" } else { "Green" })
Write-Host "=================================`n" -ForegroundColor Cyan

$total = $violations + $(if ($Strict) { $warnings } else { 0 })
if ($total -gt 0) {
    Write-Host "Run with -Strict to treat warnings as errors (for CI)." -ForegroundColor Yellow
    exit 1
}

exit 0
