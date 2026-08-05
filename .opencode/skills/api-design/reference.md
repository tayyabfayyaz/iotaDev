# API Design & FastAPI Technical Reference

Detailed patterns, anti-patterns, and working examples for every principle.

---

## 1. Endpoint Naming — Rules & Examples

### Correct Naming Patterns

```
✅ GET    /api/users                # List users
✅ GET    /api/users/42             # Get user by ID
✅ POST   /api/users                # Create user
✅ PUT    /api/users/42             # Full update
✅ PATCH  /api/users/42             # Partial update
✅ DELETE /api/users/42             # Delete user
✅ GET    /api/users/42/orders      # User's orders (1-level nesting)
✅ GET    /api/users/42/orders/15   # Specific order (2-level nesting — max)
```

### Anti-Patterns

```
❌ GET    /api/getUsers             # Verb in URL — use GET /api/users
❌ GET    /api/get_user/42          # Verb + no resource naming
❌ POST   /api/users/create         # Redundant action verb
❌ GET    /api/Users                # Mixed case — use lowercase
❌ GET    /api/user_list            # Underscore + non-standard
❌ GET    /api/customer_accounts    # Underscore — use kebab-case
❌ GET    /api/users/42/orders/15/items/3/details  # Too deeply nested
```

### Kebab-Case for Multi-Word Resources

```
✅ GET /api/blog-posts
✅ GET /api/order-items
✅ GET /api/payment-methods

❌ GET /api/blogPosts        # camelCase
❌ GET /api/blog_posts       # snake_case
❌ GET /api/BlogPosts        # PascalCase
```

---

## 2. Status Codes — Extended Reference

### Success Codes

| Code | Constant | Typical Body | Example |
|------|----------|-------------|---------|
| `200` | `HTTP_200_OK` | Resource or list | `GET /api/users/42` returns user object |
| `201` | `HTTP_201_CREATED` | Created resource + Location header | `POST /api/users` returns new user |
| `202` | `HTTP_202_ACCEPTED` | Job/task ID | Async processing accepted |
| `204` | `HTTP_204_NO_CONTENT` | Empty body | `DELETE /api/users/42` successful |

### Client Error Codes

| Code | Constant | When | Example |
|------|----------|------|---------|
| `400` | `HTTP_400_BAD_REQUEST` | Malformed input Pydantic can't catch | Invalid JSON, wrong content-type |
| `401` | `HTTP_401_UNAUTHORIZED` | Missing or expired token | No `Authorization` header |
| `403` | `HTTP_403_FORBIDDEN` | Valid auth, insufficient permissions | User tries admin endpoint |
| `404` | `HTTP_404_NOT_FOUND` | Resource doesn't exist | `GET /api/users/99999` |
| `409` | `HTTP_409_CONFLICT` | Duplicate, version conflict | Slug already in use |
| `422` | `HTTP_422_UNPROCESSABLE_ENTITY` | Validation failure | Empty required field, bad email |
| `429` | `HTTP_429_TOO_MANY_REQUESTS` | Rate limited | Too many login attempts |

### Server Error Codes

| Code | Constant | Usage |
|------|----------|-------|
| `500` | `HTTP_500_INTERNAL_SERVER_ERROR` | Unexpected exception (catch-all) |
| `502` | `HTTP_502_BAD_GATEWAY` | Upstream service returned invalid response |
| `503` | `HTTP_503_SERVICE_UNAVAILABLE` | Service down, maintenance, missing config |

### Full Example — Route With All Status Codes Documented

```python
from fastapi import APIRouter, status

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"description": "Invalid JSON body"},
        409: {"description": "Email already registered"},
        422: {"description": "Validation error — see detail for field-level errors"},
    },
)
async def create_user(data: UserCreate):
    ...
```

---

## 3. Response Shape — Consistent Envelope Patterns

### Simple Success

```json
{
  "data": {
    "id": 42,
    "name": "John",
    "email": "john@example.com"
  }
}
```

### List With Pagination

```json
{
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Structured Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "value is not a valid email address" },
      { "field": "name", "message": "ensure this value has at least 1 character" }
    ]
  }
}
```

### FastAPI Response Model — Implementation

```python
from pydantic import BaseModel
from typing import Generic, TypeVar

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    data: T

class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    meta: dict

# Usage
@app.get("/api/users", response_model=APIResponse[list[UserOut]])
async def list_users():
    users = await get_all_users()
    return APIResponse(data=users)
```

### Project-Specific Pattern

This project (iotaDev) uses flat responses without an envelope — each endpoint returns the payload directly. This is acceptable for small, internal APIs when simplicity is preferred:

```python
# Current project convention — direct payload
@app.get("/api/blog", response_model=list[BlogPostIn])  # implicit list response
async def get_blog_articles():
    return articles  # Direct array — no { data: [...] } wrapper
```

---

## 4. Authentication & Authorization

### Bearer Token Auth — Complete Pattern

```python
import os
import hmac
from fastapi import Header, HTTPException

ADMIN_KEY = os.getenv("ADMIN_KEY", "")

def require_admin(authorization: str = Header(default="")):
    if not ADMIN_KEY:
        raise HTTPException(status_code=503, detail="Admin key not configured")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    provided = authorization.removeprefix("Bearer ").strip()
    if not hmac.compare_digest(provided, ADMIN_KEY):
        raise HTTPException(status_code=401, detail="Invalid credentials")
```

### Why `hmac.compare_digest` Over `==`

```python
# ❌ Timing attack vulnerable — early exit on first different char
if provided_key == ADMIN_KEY:  # BAD

# ✅ Constant-time comparison — same duration regardless of match
if not hmac.compare_digest(provided_key, ADMIN_KEY):  # GOOD
```

### JWT Token Pattern

```python
import jwt
from datetime import datetime, timedelta, timezone

def create_token(user_id: str, secret: str) -> str:
    payload = {
        "sub": user_id,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, secret, algorithm="HS256")

def verify_token(token: str, secret: str) -> dict:
    try:
        return jwt.decode(token, secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
```

### CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[          # ✅ Whitelist specific origins
        "http://localhost:3000",
        "https://iotadev.com",
        "https://www.iotadev.com",
    ],
    allow_credentials=True,  # ✅ Required for cookies/auth headers
    allow_methods=["*"],     # or ["GET", "POST", "PUT", "DELETE"]
    allow_headers=["*"],     # or ["Authorization", "Content-Type"]
)

# ❌ NEVER allow_origins=["*"] with allow_credentials=True
#    (browsers will reject this combination anyway)
```

---

## 5. Pydantic Models — Complete Patterns

### Input Models

```python
from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import date

class PostCreate(BaseModel):
    """Shape the client sends to create a post."""
    slug: str = Field(
        min_length=1,
        max_length=200,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",  # kebab-case validation
    )
    title: str = Field(min_length=1, max_length=300)
    date: str  # "2025-01-15" — validated as ISO date elsewhere
    author: str = Field(min_length=1, max_length=100)
    excerpt: str = Field(min_length=1, max_length=500)
    content: str = Field(min_length=1)
    tags: list[str] = []
    featured_image: str = Field(default="", alias="featuredImage")

    @field_validator("slug", mode="after")
    @classmethod
    def slug_must_be_clean(cls, v: str) -> str:
        if v.startswith("-") or v.endswith("-"):
            raise ValueError("Slug must not start or end with a hyphen")
        return v
```

### Output Models

```python
class PostResponse(BaseModel):
    """Shape the server returns."""
    id: int
    slug: str
    title: str
    date: str
    author: str
    excerpt: str
    content: str
    tags: list[str]
    featured_image: str

    model_config = ConfigDict(from_attributes=True)
```

### Partial Update Models

```python
class PostUpdate(BaseModel):
    """All fields optional for PATCH."""
    slug: str | None = Field(default=None, min_length=1, max_length=200)
    title: str | None = Field(default=None, min_length=1, max_length=300)
    date: str | None = None
    author: str | None = None
    excerpt: str | None = None
    content: str | None = None
    tags: list[str] | None = None
    featured_image: str | None = None
```

### Common Field Types Reference

| Python Type | Pydantic Type | Validates |
|-------------|---------------|-----------|
| `str` | `str` / `Field(min_length=1, max_length=200)` | String with constraints |
| `int` | `int` / `Field(ge=0, le=100)` | Integer with min/max |
| `float` | `float` / `Field(gt=0)` | Float with min/max |
| `bool` | `bool` | `true`/`false` or `1`/`0` |
| `datetime` | `datetime` | ISO 8601 string → datetime |
| `date` | `date` | `"2025-01-15"` → date |
| `list[str]` | `list[str]` | Array of strings |
| `str \| None` | Optional field | Nullable / optional |
| `EmailStr` | Requires `email-validator` | Valid email format |
| `AnyUrl` | Requires Pydantic | Valid URL format |
| `UUID4` | `uuid.UUID` | Valid UUID v4 string |
| `Enum` | `StrEnum` / `IntEnum` | Must be one of the enum values |

### ConfigDict Options

```python
class MyModel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,       # Allow ORM model → Pydantic conversion
        populate_by_name=True,      # Accept field names OR aliases
        str_strip_whitespace=True,  # Auto-strip string fields
        use_enum_values=True,       # Serialize enums as their values
        extra="forbid",             # Reject unknown fields (default for v2)
    )
```

---

## 6. Async vs Sync — Decision Flowchart

```
Is the operation I/O-bound? (DB query, API call, file read)
├── Yes: Use async driver/httpx?
│   ├── Yes → async def + await
│   └── No (sync driver like sqlite3) → def (sync)  // FastAPI offloads to threadpool
└── No (CPU-bound: calculations, processing):
    └── Use task queue (Celery/ARQ) or run_in_threadpool
```

### Common Libraries and Their Async Status

| Library | Sync | Async | Recommendation |
|---------|------|-------|----------------|
| sqlite3 (stdlib) | `conn.execute()` | — | Use in `def` routes |
| SQLAlchemy 2.0 | — | `AsyncSession` | Use in `async def` routes |
| httpx | `httpx.Client` | `httpx.AsyncClient` | Prefer `AsyncClient` in routes |
| requests | `requests.get()` | — | Use in `def` routes or `run_in_threadpool` |
| aiohttp | — | `aiohttp.ClientSession` | Use in `async def` routes |
| psycopg2 | `conn.execute()` | — | Use in `def` routes |
| asyncpg | — | `conn.execute()` | Use in `async def` routes |

### Offloading Sync Code in Async Routes

```python
from fastapi.concurrency import run_in_threadpool

@app.get("/api/external-data")
async def get_external_data():
    # sync library in async route — must offload
    data = await run_in_threadpool(sync_sdk.get_data)
    return data
```

---

## 7. Dependencies — Advanced Patterns

### Dependency With Teardown (DB Connection)

```python
from contextlib import asynccontextmanager

async def get_db():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()  # Always closes, even on error

@app.get("/api/posts")
def list_posts(conn = Depends(get_db)):
    return fetch_all(conn, "blog_articles")
```

### Dependency With Query Parameters

```python
async def pagination(page: int = 1, limit: int = 20):
    if page < 1:
        raise HTTPException(422, "Page must be >= 1")
    if limit < 1 or limit > 100:
        raise HTTPException(422, "Limit must be between 1 and 100")
    return {"offset": (page - 1) * limit, "limit": limit}

@app.get("/api/posts")
async def list_posts(paginator: dict = Depends(pagination)):
    offset = paginator["offset"]
    limit = paginator["limit"]
    ...
```

### Dependency Override in Tests

```python
# In test file
from src.main import app
from src.auth.dependencies import require_admin

def fake_admin():
    pass  # No-op auth for tests

app.dependency_overrides[require_admin] = fake_admin

# After: all routes using require_admin will pass without real auth
```

### Cached Dependency Behavior

```python
# parse_token is used in 3 places below — but only executes ONCE per request
async def valid_post(post_id: UUID4, token=Depends(parse_token)):
    ...

async def valid_owner(post_id: UUID4, token=Depends(parse_token)):
    ...

# In route:
@app.get("/posts/{post_id}")
async def get_post(
    post = Depends(valid_post),       # calls parse_token (first time — executed)
    owner = Depends(valid_owner),     # calls parse_token (second time — cached)
    token = Depends(parse_token),     # calls parse_token (third time — cached)
):
    ...
```

---

## 8. Error Handling — Complete Patterns

### Structured Error Details

```python
# In dependencies or routes
raise HTTPException(
    status_code=404,
    detail={
        "code": "POST_NOT_FOUND",
        "message": f"No blog post found with slug '{slug}'",
    },
)

# FastAPI auto-returns: { "detail": { "code": "POST_NOT_FOUND", ... } }
```

### Custom Exception Handlers

```python
from fastapi import Request
from fastapi.responses import JSONResponse

class AppError(Exception):
    def __init__(self, code: str, message: str, status: int = 400):
        self.code = code
        self.message = message
        self.status = status

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status,
        content={"error": {"code": exc.code, "message": exc.message}},
    )

# Usage anywhere
raise AppError("POST_NOT_FOUND", f"No post with slug '{slug}'", 404)
```

### Global Catch-All

```python
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the real error
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    # Return sanitized response
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred"}},
    )
```

---

## 9. Client Consumption — Complete Examples

### TypeScript Fetch Wrapper (Project Pattern)

```typescript
// src/lib/admin.ts — this project's convention
export async function adminFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const key = getAdminKey();
  if (!key) throw new Error("Not authenticated");

  const res = await fetch(path, {
    ...options,
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed (${res.status})`);
  }
  return res;
}

// Usage
const res = await adminFetch("/api/admin/blog");
const posts = await res.json();
```

### Next.js Server-to-Server Proxy Pattern

```typescript
// Using Next.js rewrites — no CORS issues
// next.config.ts
const nextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "http://localhost:8000/api/:path*" },
    ];
  },
};

// Client calls /api/* — Next proxies to backend
const res = await fetch("/api/admin/blog", {
  headers: { Authorization: `Bearer ${key}` },
});
```

### Python httpx (Async Client)

```python
import httpx

async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
    # GET
    resp = await client.get("/api/blog")
    resp.raise_for_status()
    posts = resp.json()

    # POST
    resp = await client.post(
        "/api/admin/blog",
        json={"slug": "hello", "title": "Hello", ...},
        headers={"Authorization": "Bearer secret"},
    )
    resp.raise_for_status()
    result = resp.json()
```

### Error Handling Pattern (All Clients)

```
1. Check HTTP status (response.ok / resp.raise_for_status())
2. Try to parse error body as JSON
3. Extract detail.message or detail.code
4. Show user-friendly message based on code
5. Log the full error for debugging
```

---

## 10. Project-Specific Conventions (iotaDev)

### Current Project Structure

```
software-house-website-v2/
├── backend/
│   ├── main.py           # All routes, models, logic (362 lines)
│   ├── database.py       # SQLite helpers: get_connection, fetch_one, fetch_all, init_db
│   ├── .env              # ADMIN_KEY, SMTP_*, etc.
│   └── .env.example      # Template (without secrets)
├── src/
│   ├── lib/
│   │   ├── api.ts        # Public API client (base URL, GET helpers)
│   │   └── admin.ts      # Admin API client (auth, CRUD)
│   ├── app/
│   │   └── admin/        # Admin panel pages
│   └── components/
│       └── admin/         # Admin UI components
├── next.config.ts         # Rewrites /api/* → localhost:8000
└── vercel.json            # Vercel deployment config
```

### Key Conventions to Follow

1. **Route prefix**: All endpoints under `/api/` (public and admin)
2. **Admin scope**: `/api/admin/*` — protected by `require_admin()` dependency
3. **Auth model**: Single shared `ADMIN_KEY` via `Bearer` token + `hmac.compare_digest`
4. **Database**: SQLite via `sqlite3` stdlib; custom wrappers in `database.py`
5. **JSON fields**: SQLite doesn't natively support JSON — serialize with `json.dumps` before INSERT, deserialize with `json.loads` after SELECT. Use `parse_json_fields()` helper.
6. **Connections**: Always open and close manually — no ORM or connection pool
7. **Date format**: ISO 8601 strings (`"2025-01-15"`) stored as TEXT in SQLite
8. **Response shape**: Direct payload (no envelope wrapper) — matches existing endpoints
9. **Frontend proxy**: Next.js rewrites `/api/*` → `http://localhost:8000/api/*` so frontend calls `/api/...` without CORS
10. **Environment variables**: Loaded via `python-dotenv` on backend, `NEXT_PUBLIC_*` on frontend

### Adding a New Resource — Step-by-Step

```
1. Define Pydantic input model in backend/main.py
2. Define Pydantic response model in backend/main.py
3. Add GET /api/resource route (public read)
4. Add GET /api/resource/{id} route (public read single)
5. Add POST /api/admin/resource route (protected create)
6. Add PUT /api/admin/resource/{id} route (protected update)
7. Add DELETE /api/admin/resource/{id} route (protected delete)
8. Add TypeScript types in src/lib/types.ts
9. Add API functions in src/lib/admin.ts or src/lib/api.ts
10. Create UI components as needed
```

### Database Helper Functions (Reference)

```python
# database.py
import sqlite3
from pathlib import Path

DB_PATH = Path("data") / "app.db"

def get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def fetch_one(conn, table: str, column: str, value) -> dict | None:
    row = conn.execute(
        f"SELECT * FROM {table} WHERE {column} = ?", (value,)
    ).fetchone()
    return dict(row) if row else None

def fetch_all(conn, table: str) -> list[dict]:
    rows = conn.execute(f"SELECT * FROM {table}").fetchall()
    return [dict(r) for r in rows]

def init_db():
    # CREATE TABLE IF NOT EXISTS statements...
    pass
```

---

## 11. Testing FastAPI Endpoints

### Async Test Client (httpx)

```python
import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"

@pytest.mark.asyncio
async def test_get_blog_empty(client: AsyncClient):
    resp = await client.get("/api/blog")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
```

### Dependency Override for Auth

```python
@pytest.fixture(autouse=True)
def bypass_auth():
    """Skip admin auth for all tests in this module."""
    from main import app
    from main import require_admin

    def _fake():
        pass

    app.dependency_overrides[require_admin] = _fake
    yield
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_admin_create_post(client: AsyncClient):
    """Auth is bypassed — no Authorization header needed."""
    resp = await client.post(
        "/api/admin/blog",
        json={"slug": "test", "title": "Test", "date": "2025-01-01", ...},
    )
    assert resp.status_code == 201
```

---

## 12. Anti-Patterns Checklist

| Anti-Pattern | Why It's Wrong | Fix |
|-------------|---------------|-----|
| Verb in URL (`/getUsers`) | HTTP method already expresses action | `GET /users` |
| `200 OK` for errors | Client can't distinguish success from failure | Use 4xx/5xx for errors |
| `500` for validation errors | Client needs to fix input; 500 means server's fault | Use 422/400 |
| String `detail` on errors | Inconsistent parsing for clients | Use structured dict: `{"code": "...", "message": "..."}` |
| Plain `except:` in routes | Swallows errors, returns nothing | Log the error, return 500 with safe message |
| Hardcoded secrets | Committed to repo, visible to everyone | Use `os.getenv()` + `.env` (gitignored) |
| `async def` + blocking I/O | Freezes the event loop | Use `def` (sync) or `run_in_threadpool` |
| No `response_model` | Leaks internal fields, can't trust output shape | Always define `response_model` |
| Reusing input model as output | Exposes fields clients shouldn't see | Separate `XCreate` and `XResponse` models |
| `CORS allow_origins=["*"]` + `allow_credentials=True` | Browsers reject this — it's a spec violation | Whitelist specific origins |
| SQL string concatenation (`f"SELECT * FROM {table}"`) | SQL injection if `table` comes from user input | Parameterize with `?` placeholders |
| Missing `Content-Type: application/json` on POST | Server may not parse the body | Always set the header |
| Not handling `res.ok` in client code | Silent failures, bad UX | Check status, parse error body, show message |
