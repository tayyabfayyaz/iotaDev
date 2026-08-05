import os
import smtplib
import json
import hmac
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from database import get_connection, init_db, fetch_all, fetch_one

load_dotenv()

app = FastAPI(
    title="iotaDev API",
    description="Backend API for iotaDev corporate website",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://iotadev.com",
        "https://www.iotadev.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ContactSubmission(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    service: Optional[str] = None
    message: str


class ContactResponse(BaseModel):
    success: bool
    message: str
    timestamp: str


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str


class BlogPostIn(BaseModel):
    slug: str
    title: str
    date: str
    author: str
    excerpt: str
    content: str
    tags: list[str] = []
    featuredImage: str = ""


class AdminActionResponse(BaseModel):
    success: bool
    slug: str = ""


ADMIN_KEY = os.getenv("ADMIN_KEY", "")


def require_admin(authorization: str):
    if not ADMIN_KEY:
        raise HTTPException(
            status_code=503,
            detail="Admin key is not configured on the server",
        )
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    provided = authorization[len("Bearer "):].strip()
    if not hmac.compare_digest(provided, ADMIN_KEY):
        raise HTTPException(status_code=401, detail="Unauthorized")


SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
NOTIFY_EMAIL = os.getenv("NOTIFY_EMAIL", "fayyaztayyab684@gmail.com")


def send_email_notification(data: ContactSubmission) -> bool:
    if not SMTP_USER or not SMTP_PASS:
        return False
    try:
        msg = EmailMessage()
        msg["Subject"] = f"New Contact from {data.name}"
        msg["From"] = SMTP_USER
        msg["To"] = NOTIFY_EMAIL
        body = f"""New contact form submission:

Name: {data.name}
Email: {data.email}
Phone: {data.phone or 'N/A'}
Service: {data.service or 'N/A'}

Message:
{data.message}

---
Submitted: {datetime.now(timezone.utc).isoformat()}
"""
        msg.set_content(body)
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
            s.starttls()
            s.login(SMTP_USER, SMTP_PASS)
            s.send_message(msg)
        return True
    except Exception:
        return False


SUBMISSIONS_DIR = Path("submissions")
SUBMISSIONS_DIR.mkdir(exist_ok=True)


def save_submission_to_db(data: ContactSubmission) -> str:
    timestamp = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    conn.execute(
        "INSERT INTO contact_submissions (name, email, phone, service, message, timestamp) VALUES (?,?,?,?,?,?)",
        (data.name, data.email, data.phone, data.service, data.message, timestamp),
    )
    conn.commit()
    conn.close()
    return timestamp


def parse_json_fields(row: dict, *fields: str) -> dict:
    for field in fields:
        if field in row and isinstance(row[field], str):
            row[field] = json.loads(row[field])
    return row


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        version="1.0.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.post("/api/contact", response_model=ContactResponse)
async def submit_contact(data: ContactSubmission):
    if not data.name.strip():
        raise HTTPException(status_code=422, detail="Name is required")
    if not data.message.strip():
        raise HTTPException(status_code=422, detail="Message is required")

    try:
        ts = save_submission_to_db(data)
        send_email_notification(data)
        return ContactResponse(
            success=True,
            message="Thank you! Your message has been received.",
            timestamp=ts,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save submission: {str(e)}",
        )


@app.get("/api/services")
async def get_services():
    conn = get_connection()
    rows = fetch_all(conn, "services")
    for r in rows:
        parse_json_fields(r, "technologies", "features")
        sub_rows = conn.execute(
            "SELECT * FROM sub_services WHERE service_id = ? ORDER BY sort_order", (r["id"],)
        ).fetchall()
        subs = []
        for sr in sub_rows:
            sub = parse_json_fields(dict(sr), "key_points", "technologies")
            sub["keyPoints"] = sub.pop("key_points")
            subs.append(sub)
        r["subServices"] = subs
    conn.close()
    return rows


@app.get("/api/services/{service_id}")
async def get_service(service_id: str):
    conn = get_connection()
    service = fetch_one(conn, "services", "id", service_id)
    if not service:
        conn.close()
        raise HTTPException(status_code=404, detail="Service not found")
    parse_json_fields(service, "technologies", "features")
    sub_rows = conn.execute(
        "SELECT * FROM sub_services WHERE service_id = ? ORDER BY sort_order", (service_id,)
    ).fetchall()
    subs = []
    for r in sub_rows:
        sub = parse_json_fields(dict(r), "key_points", "technologies")
        sub["keyPoints"] = sub.pop("key_points")
        subs.append(sub)
    conn.close()
    service["subServices"] = subs
    return service


@app.get("/api/portfolio")
async def get_portfolio(featured: bool = False):
    conn = get_connection()
    if featured:
        rows = conn.execute("SELECT * FROM portfolio WHERE featured = 1 ORDER BY sort_order").fetchall()
    else:
        rows = fetch_all(conn, "portfolio")
    items = [parse_json_fields(dict(r), "technologies") for r in rows]
    conn.close()
    return items


@app.get("/api/portfolio/{item_id}")
async def get_portfolio_item(item_id: str):
    conn = get_connection()
    item = fetch_one(conn, "portfolio", "id", item_id)
    conn.close()
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return parse_json_fields(item, "technologies")


@app.get("/api/team")
async def get_team():
    conn = get_connection()
    rows = fetch_all(conn, "team_members")
    members = [parse_json_fields(dict(r), "social") for r in rows]
    conn.close()
    return members


@app.get("/api/testimonials")
async def get_testimonials():
    conn = get_connection()
    rows = fetch_all(conn, "testimonials")
    conn.close()
    return [dict(r) for r in rows]


@app.get("/api/faq")
async def get_faq():
    conn = get_connection()
    rows = fetch_all(conn, "faq")
    conn.close()
    return [dict(r) for r in rows]


@app.get("/api/blog")
async def get_blog_articles():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM blog_articles ORDER BY date DESC").fetchall()
    articles = [parse_json_fields(dict(r), "tags") for r in rows]
    conn.close()
    return articles


@app.get("/api/blog/{slug}")
async def get_blog_article(slug: str):
    conn = get_connection()
    article = fetch_one(conn, "blog_articles", "slug", slug)
    conn.close()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return parse_json_fields(article, "tags")


@app.get("/api/admin/blog")
async def admin_list_blog(authorization: str = Header(default="")):
    require_admin(authorization)
    conn = get_connection()
    rows = conn.execute("SELECT * FROM blog_articles ORDER BY date DESC").fetchall()
    articles = [parse_json_fields(dict(r), "tags") for r in rows]
    conn.close()
    return articles


@app.post("/api/admin/blog", response_model=AdminActionResponse, status_code=201)
async def admin_create_blog(post: BlogPostIn, authorization: str = Header(default="")):
    require_admin(authorization)
    slug = post.slug.strip()
    if not slug:
        raise HTTPException(status_code=422, detail="Slug is required")
    conn = get_connection()
    if fetch_one(conn, "blog_articles", "slug", slug):
        conn.close()
        raise HTTPException(status_code=409, detail="A post with this slug already exists")
    conn.execute(
        "INSERT INTO blog_articles (slug, title, date, author, excerpt, content, tags, featured_image, sort_order) VALUES (?,?,?,?,?,?,?,?,0)",
        (slug, post.title.strip(), post.date, post.author.strip(), post.excerpt.strip(),
         post.content, json.dumps(post.tags), post.featuredImage),
    )
    conn.commit()
    conn.close()
    return AdminActionResponse(success=True, slug=slug)


@app.put("/api/admin/blog/{slug}", response_model=AdminActionResponse)
async def admin_update_blog(slug: str, post: BlogPostIn, authorization: str = Header(default="")):
    require_admin(authorization)
    conn = get_connection()
    if not fetch_one(conn, "blog_articles", "slug", slug):
        conn.close()
        raise HTTPException(status_code=404, detail="Article not found")
    new_slug = post.slug.strip()
    if not new_slug:
        conn.close()
        raise HTTPException(status_code=422, detail="Slug is required")
    if new_slug != slug and fetch_one(conn, "blog_articles", "slug", new_slug):
        conn.close()
        raise HTTPException(status_code=409, detail="A post with this slug already exists")
    conn.execute(
        "UPDATE blog_articles SET slug=?, title=?, date=?, author=?, excerpt=?, content=?, tags=?, featured_image=? WHERE slug=?",
        (new_slug, post.title.strip(), post.date, post.author.strip(), post.excerpt.strip(),
         post.content, json.dumps(post.tags), post.featuredImage, slug),
    )
    conn.commit()
    conn.close()
    return AdminActionResponse(success=True, slug=new_slug)


@app.delete("/api/admin/blog/{slug}", response_model=AdminActionResponse)
async def admin_delete_blog(slug: str, authorization: str = Header(default="")):
    require_admin(authorization)
    conn = get_connection()
    if not fetch_one(conn, "blog_articles", "slug", slug):
        conn.close()
        raise HTTPException(status_code=404, detail="Article not found")
    conn.execute("DELETE FROM blog_articles WHERE slug = ?", (slug,))
    conn.commit()
    conn.close()
    return AdminActionResponse(success=True, slug=slug)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
