---
name: api-design
description: Enforce REST API best practices for FastAPI backends — endpoint naming, status codes, response shapes, error handling, security, Pydantic schemas, dependency injection, async patterns, and client consumption. Use when building, reviewing, or debugging any API endpoint, route, or HTTP client call.
metadata:
  audience: backend
  discipline: api-engineering
---

## What I do

I enforce a comprehensive set of REST API and FastAPI conventions on every backend change. I review code for violations against established patterns, suggest fixes, and provide concrete Python/cURL/JS examples.

## When to use me

Use me when:
- Creating or modifying FastAPI route handlers (`@app.get`, `@app.post`, etc.)
- Writing Pydantic request/response models
- Adding authentication, middleware, CORS, or dependencies
- Calling APIs from frontend code (fetch, cURL, Python requests)
- Reviewing endpoint naming, status codes, or response shapes
- Setting up or reviewing a FastAPI project structure
- Debugging API errors or inconsistent response formats

## Core Principles

### 1. API Endpoint Design

**Resource naming:**
- Use **plural nouns** for collections: `/users`, `/posts`, `/products`
- Use **nouns, not verbs**: `GET /users` (not `/getUsers`); let HTTP method express the action
- Use **kebab-case** for multi-word resources: `/blog-posts`, `/order-items`
- Path parameters for single resources: `/users/{user_id}`, `/posts/{slug}`
- Nest to reflect relationships but max ~2 levels: `/users/{id}/orders`, not `/users/{id}/orders/{order_id}/items/{item_id}/details`

**HTTP method conventions:**

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| `GET` | Read/retrieve resource(s) | Yes | Yes |
| `POST` | Create a new resource | No | No |
| `PUT` | Full replace/update a resource | Yes | No |
| `PATCH` | Partial update a resource | No | No |
| `DELETE` | Remove a resource | Yes | No |

**HTTP status codes — use the right one:**

| Code | Meaning | When to use |
|------|---------|------------|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE (no body returned) |
| `301` | Moved Permanently | Resource URL has changed permanently |
| `400` | Bad Request | Malformed input (not caught by validation) |
| `401` | Unauthorized | Missing or invalid auth credentials |
| `403` | Forbidden | Valid credentials but insufficient permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate resource, version conflict |
| `422` | Unprocessable Entity | Validation error on request body/params |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server failure |
| `503` | Service Unavailable | Downstream service down, maintenance |

**Versioning:**
- Prefer URL-prefix versioning: `/api/v1/users`, `/api/v2/users`
- Alternative: `Accept: application/vnd.api.v1+json` header
- Never break existing consumers without a new version

**Query parameters** — used for filtering, sorting, pagination:
```
GET /products?category=shoes&color=black&sort=-price&page=2&limit=20
```

### 2. Response Shape

**Consistent JSON envelope** for all endpoints:
```json
// Success
{
  "data": { ... } | [ ... ],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 150
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": [
      { "field": "title", "message": "must not be empty" }
    ]
  }
}
```

**Pydantic response models:**
- Always define explicit `response_model` — controls serialization, drops internal fields
- Use `response_model=list[PostResponse]` for lists
- Use `response_model_exclude_none=True` to strip nulls
- Prefer Pydantic models over raw dicts for response shaping

### 3. Error Handling

**Structured errors:**

```python
from fastapi import HTTPException

# ✅ Always use HTTPException with detail
raise HTTPException(status_code=404, detail={"code": "POST_NOT_FOUND", "message": f"No post with slug '{slug}'"})

# ❌ Never return 200 for errors or use generic messages
raise HTTPException(status_code=500, detail="Error")  # Bad — no context
```

**Validation errors:**
- FastAPI auto-returns 422 with field-level details for Pydantic validation failures
- Add custom field-level validation with `@field_validator`
- Use `responses` dict on decorators to document all possible error responses in OpenAPI

**Error code naming convention:** `ENTITY_REASON` (e.g., `POST_NOT_FOUND`, `SLUG_ALREADY_EXISTS`, `UNAUTHORIZED`)

### 4. Security

**Authentication:**
- **Bearer token** for API auth: `Authorization: Bearer <token>`
- Use `hmac.compare_digest()` for constant-time token comparison (prevents timing attacks)
- Validate auth in a **dependency function**, not in every route body
- Return `401` for missing/invalid credentials, `403` for insufficient permissions

**Input validation:**
- Never trust client input — always validate with Pydantic models
- Use `max_length`, `min_length`, `pattern` on string fields
- Use `EmailStr` for email fields, `AnyUrl` for URLs
- Sanitize HTML content if your app renders user content

**Additional layers:**
- HTTPS everywhere in production
- Rate limiting (slowapi, or external gateway)
- CORS: whitelist specific origins, not `*` in production
- Never expose stack traces or internal errors to clients
- Secrets in environment variables, never committed

### 5. Pydantic Schemas

**Separate input and output models:**

```python
# ✅ Separate models
class PostCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str

class PostResponse(BaseModel):
    id: int
    slug: str
    title: str
    created_at: datetime

# ❌ Don't reuse input model for response — leaks internal fields
```

**Model patterns:**
- `PostIn` / `PostCreate` — the shape the client sends
- `PostResponse` / `PostOut` — the shape the server returns
- `PostUpdate` — partial update (all fields optional)
- Use `model_config = ConfigDict(from_attributes=True)` for ORM model compatibility

**Field validation:**

```python
from pydantic import BaseModel, Field, EmailStr, field_validator

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    email: EmailStr
    age: int = Field(ge=13, le=120)
    website: str | None = None

    @field_validator("username", mode="after")
    @classmethod
    def username_not_reserved(cls, v: str) -> str:
        reserved = {"admin", "root", "api", "system"}
        if v.lower() in reserved:
            raise ValueError("Username is reserved")
        return v
```

### 6. FastAPI Project Structure

**Domain-based layout** (scales better than type-based):

```
backend/
├── main.py              # App init, CORS, lifespan, root router
├── database.py          # DB connection, session helpers
├── config.py            # Global settings (env vars)
├── auth/
│   ├── router.py        # /api/auth/* endpoints
│   ├── schemas.py       # Pydantic models
│   ├── dependencies.py  # require_auth, get_current_user
│   ├── service.py       # Business logic
│   └── utils.py         # Token helpers
├── blog/
│   ├── router.py
│   ├── schemas.py
│   ├── dependencies.py
│   └── service.py
└── tests/
    ├── test_auth.py
    └── test_blog.py
```

**Flat layout** (works for small projects, what this project uses):

```
backend/
├── main.py      # All routes, models, and logic in one file
├── database.py  # DB layer
└── .env         # Secrets
```

### 7. Dependencies & Dependency Injection

**Use dependencies for cross-cutting concerns:**

```python
from fastapi import Depends, Header, HTTPException

# Reusable auth guard — called automatically, result cached per request
async def require_admin(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    # ... validate ...

# Injected into route — no code duplication
@app.get("/api/admin/posts")
async def list_posts(_auth = Depends(require_admin)):
    # _auth is the dependency itself; its result is cached if called again
    ...
```

**Chain dependencies:**

```python
async def get_current_user(token = Depends(parse_token)):
    user = await db.get_user(token["sub"])
    if not user:
        raise HTTPException(401)
    return user

async def require_admin_user(user = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    return user
```

**Key facts:**
- Dependencies are **cached per request** — if `parse_token` is used in 3 places, it runs once
- Prefer `async` dependencies (no thread-pool overhead)
- Use `yield` in dependencies for teardown (close DB connections, etc.)
- Override dependencies in tests with `app.dependency_overrides`

### 8. Async vs Sync Routes

| Scenario | Use | Why |
|----------|-----|-----|
| DB query (async driver) | `async def` | Event loop stays free |
| DB query (sync driver / sqlite3) | `def` (sync) | FastAPI runs in threadpool automatically |
| External API call | `async def` + `httpx.AsyncClient` | Non-blocking I/O |
| CPU-heavy work | `def` + `run_in_threadpool` / task queue | Don't block event loop |
| Simple logic (no I/O) | `async def` | Slightly faster (no thread overhead) |

```python
# ✅ Correct: sync sqlite3 in def route — auto-threadpool
@app.get("/api/posts")
def get_posts():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM posts").fetchall()
    conn.close()
    return rows

# ❌ Wrong: blocking I/O in async route — freezes event loop
@app.get("/api/posts")
async def get_posts():
    time.sleep(2)  # NEVER do this in async
    ...
```

### 9. Consuming APIs (Client Side)

**cURL:**

```bash
# GET request
curl -X GET "http://localhost:8000/api/health" -H "Accept: application/json"

# GET with auth
curl -X GET "http://localhost:8000/api/admin/blog" \
  -H "Authorization: Bearer SECRET_KEY"

# POST with JSON body
curl -X POST "http://localhost:8000/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","message":"Hello"}'

# PUT with JSON body
curl -X PUT "http://localhost:8000/api/admin/blog/my-post" \
  -H "Authorization: Bearer SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"slug":"my-post","title":"Updated Title",...}'

# DELETE
curl -X DELETE "http://localhost:8000/api/admin/blog/my-post" \
  -H "Authorization: Bearer SECRET_KEY"
```

**JavaScript fetch:**

```typescript
// GET
const res = await fetch("/api/blog");
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();

// POST with JSON
const res = await fetch("/api/admin/blog", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${getAdminKey()}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(postData),
});
if (!res.ok) {
  const err = await res.json();
  throw new Error(err.detail || "Request failed");
}
const result = await res.json();

// Always: check response.ok, handle errors, parse response once
// Never: hardcode secrets in client-side code
```

**Python requests:**

```python
import requests

# GET
resp = requests.get(
    "http://localhost:8000/api/blog",
    headers={"Accept": "application/json"},
)
resp.raise_for_status()
data = resp.json()

# POST
resp = requests.post(
    "http://localhost:8000/api/admin/blog",
    json={"slug": "hello", "title": "Hello World", ...},
    headers={"Authorization": f"Bearer {admin_key}"},
)
resp.raise_for_status()
result = resp.json()
```

### 10. OpenAPI Documentation

**FastAPI auto-generates OpenAPI from your code:**
- `/docs` — Swagger UI (interactive)
- `/redoc` — ReDoc (clean, readable)
- `/openapi.json` — Raw OpenAPI spec

**Enhance docs with metadata:**

```python
app = FastAPI(
    title="iotaDev API",
    description="Backend API for iotaDev corporate website",
    version="1.0.0",
)

@app.get(
    "/api/blog/{slug}",
    response_model=PostResponse,
    status_code=200,
    summary="Get a blog post by slug",
    description="Returns a single blog post with tags array.",
    tags=["Blog"],
    responses={
        404: {"description": "Post not found"},
    },
)
```

**Route attributes that improve OpenAPI:**
- `response_model` — shapes output in docs and at runtime
- `status_code` — documents the success code
- `summary` / `description` — human-readable descriptions
- `tags` — groups endpoints in Swagger UI
- `responses` — documents non-200 status codes
- `deprecated=True` — marks endpoints as deprecated

### 11. Database Conventions (Project-Specific)

This project uses SQLite with custom helpers. Follow these patterns:

```python
from database import get_connection, fetch_one, fetch_all, init_db

# Get all rows from a table
conn = get_connection()
rows = fetch_all(conn, "table_name")
conn.close()

# Get one row by column
item = fetch_one(conn, "blog_articles", "slug", slug)

# JSON fields in SQLite: serialize/deserialize via json.loads/json.dumps
tags = json.dumps(["python", "fastapi"])  # for INSERT/UPDATE
tags = json.loads(row["tags"])            # for SELECT

# Use parse_json_fields() helper for SELECT results
parse_json_fields(row, "tags", "technologies")

# Always close connections after use (no connection pooling with sqlite3)
conn.close()
```

## Review Checklist

When reviewing any API change, verify in this order:

1. [ ] **Naming**: nouns, kebab-case, plural collections, max 2 nesting levels
2. [ ] **HTTP method**: correct verb for the action (GET/POST/PUT/DELETE)
3. [ ] **Status code**: correct code for each response path (200/201/204/400/401/403/404/409/422/500)
4. [ ] **Response shape**: Pydantic `response_model` defined, consistent envelope
5. [ ] **Error handling**: HTTPException with structured detail, not bare strings
6. [ ] **Security**: Bearer auth via dependency, `hmac.compare_digest`, secrets in env
7. [ ] **Pydantic**: separate input/output models, field validations, proper types
8. [ ] **Async**: correct async/sync choice based on I/O type
9. [ ] **Dependencies**: extracted where reusable, prefer async, chain where logical
10. [ ] **Documentation**: `response_model`, `status_code`, `tags`, `responses` set on decorators
11. [ ] **Client code**: checks `res.ok`, handles errors, no hardcoded secrets
12. [ ] **Database**: connection opened and closed, JSON fields parsed, no SQL injection

## Supporting Files

- `reference.md` — detailed technical reference with full code examples, anti-patterns, and project-specific conventions
- `scripts/check-api.ps1` — PowerShell script to scan a FastAPI codebase for endpoint design and error handling violations
