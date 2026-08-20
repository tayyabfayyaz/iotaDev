import os
import smtplib
import json
import hmac
import uuid
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

_default_origins = [
    "http://localhost:3000",
    "https://iotadev.com",
    "https://www.iotadev.com",
    "https://iota-dev.vercel.app",
    "https://iota-iota.vercel.app",
]
_cors_origins = os.getenv("CORS_ORIGINS", "").split(",")
_cors_origins = [o.strip() for o in _cors_origins if o.strip()] or _default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
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


class TestimonialSubmission(BaseModel):
    quote: str
    clientName: str
    company: str
    role: str


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str


ADMIN_KEY = os.getenv("ADMIN_KEY", "")

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")

AGENT_SYSTEM_PROMPT = """You are "iota", the friendly AI assistant for iotaDev, a software house.
Answer questions about iotaDev's services, capabilities, and process. Be concise, helpful, and professional. Use plain markdown.

Company facts:
- iotaDev offers three core services: Web Development, AI & Machine Learning, and Cloud Consulting.
- Web Development: custom websites and web apps using React, Next.js, and TypeScript.
- AI & ML: LLM applications, intelligent document processing, and custom AI solutions.
- Cloud: migration, infrastructure, and DevOps.
- Engagement process: discovery -> proposal -> build -> launch -> support.

Guidelines:
- For pricing, timelines, or a custom quote, ask about their project and direct them to the Contact page.
- Do not invent specific prices, client names, or case studies.
- If asked something outside iotaDev's domain, politely steer back to how iotaDev can help.
- If you don't know, say so and offer to connect them with the team."""


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
        "INSERT INTO contact_submissions (name, email, phone, service, message, timestamp) VALUES (%s,%s,%s,%s,%s,%s)",
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
            "SELECT * FROM sub_services WHERE service_id = %s ORDER BY sort_order", (r["id"],)
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
        "SELECT * FROM sub_services WHERE service_id = %s ORDER BY sort_order", (service_id,)
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
    rows = conn.execute("SELECT * FROM testimonials WHERE approved = 1 ORDER BY sort_order").fetchall()
    conn.close()
    items = []
    for r in rows:
        item = dict(r)
        if "client_name" in item:
            item["clientName"] = item.pop("client_name")
        items.append(item)
    return items


@app.post("/api/testimonials/submit", status_code=201)
async def submit_testimonial(data: TestimonialSubmission):
    quote = data.quote.strip()
    name = data.clientName.strip()
    company = data.company.strip()
    role = data.role.strip()
    if not quote or not name:
        raise HTTPException(status_code=422, detail="Quote and name are required")
    tid = f"t-{uuid.uuid4().hex[:10]}"
    ts = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    conn.execute(
        "INSERT INTO testimonials (id, quote, client_name, company, role, logo, approved, timestamp, sort_order) VALUES (%s,%s,%s,%s,%s,%s,0,%s,0)",
        (tid, quote, name, company, role, "", ts),
    )
    conn.commit()
    conn.close()
    return {"success": True, "id": tid}


@app.get("/api/admin/testimonials")
async def admin_list_testimonials(authorization: str = Header(default="")):
    require_admin(authorization)
    conn = get_connection()
    rows = conn.execute("SELECT * FROM testimonials ORDER BY approved ASC, timestamp DESC").fetchall()
    conn.close()
    items = []
    for r in rows:
        item = dict(r)
        if "client_name" in item:
            item["clientName"] = item.pop("client_name")
        items.append(item)
    return items


@app.post("/api/admin/testimonials/{tid}/approve")
async def admin_approve_testimonial(tid: str, authorization: str = Header(default="")):
    require_admin(authorization)
    conn = get_connection()
    cur = conn.execute("UPDATE testimonials SET approved = 1 WHERE id = %s", (tid,))
    rowcount = cur.rowcount
    conn.commit()
    conn.close()
    if rowcount == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"success": True, "id": tid}


@app.delete("/api/admin/testimonials/{tid}")
async def admin_reject_testimonial(tid: str, authorization: str = Header(default="")):
    require_admin(authorization)
    conn = get_connection()
    cur = conn.execute("DELETE FROM testimonials WHERE id = %s", (tid,))
    rowcount = cur.rowcount
    conn.commit()
    conn.close()
    if rowcount == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"success": True, "id": tid}


@app.post("/api/agent/chat", response_model=ChatResponse)
async def agent_chat(req: ChatRequest):
    message = req.message.strip()
    if not message:
        raise HTTPException(status_code=422, detail="Message is required")
    if not DEEPSEEK_API_KEY:
        raise HTTPException(status_code=503, detail="Agent is not configured on the server")
    try:
        from openai import OpenAI
        client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)
        messages = [{"role": "system", "content": AGENT_SYSTEM_PROMPT}]
        for m in req.history[-10:]:
            messages.append({"role": m.role, "content": m.content})
        messages.append({"role": "user", "content": message})
        resp = client.chat.completions.create(
            model="deepseek-chat",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        reply = (resp.choices[0].message.content or "").strip()
        return ChatResponse(reply=reply)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Agent error: {str(e)}")


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
        "INSERT INTO blog_articles (slug, title, date, author, excerpt, content, tags, featured_image, sort_order) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,0)",
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
        "UPDATE blog_articles SET slug=%s, title=%s, date=%s, author=%s, excerpt=%s, content=%s, tags=%s, featured_image=%s WHERE slug=%s",
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
    conn.execute("DELETE FROM blog_articles WHERE slug = %s", (slug,))
    conn.commit()
    conn.close()
    return AdminActionResponse(success=True, slug=slug)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
