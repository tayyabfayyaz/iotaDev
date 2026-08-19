import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from database import get_connection, init_db

SRC_DATA = Path(__file__).parent.parent / "src" / "data"

def load_json(name: str):
    with open(SRC_DATA / f"{name}.json", encoding="utf-8") as f:
        return json.load(f)

def seed():
    init_db()
    conn = get_connection()

    # --- Services ---
    conn.execute("DELETE FROM sub_services")
    conn.execute("DELETE FROM services")
    services = load_json("services")
    for i, s in enumerate(services):
        conn.execute(
            "INSERT INTO services (id, title, tagline, description, icon, technologies, features, sort_order) VALUES (?,?,?,?,?,?,?,?)",
            (s["id"], s["title"], s["tagline"], s["description"], s["icon"],
             json.dumps(s["technologies"]), json.dumps(s["features"]), i),
        )
        for j, sub in enumerate(s.get("subServices", [])):
            conn.execute(
                "INSERT INTO sub_services (id, service_id, title, tagline, description, icon, image, key_points, technologies, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?)",
                (sub["id"], s["id"], sub["title"], sub["tagline"], sub["description"],
                 sub["icon"], sub.get("image", ""),
                 json.dumps(sub["keyPoints"]), json.dumps(sub["technologies"]), j),
            )

    # --- Portfolio ---
    conn.execute("DELETE FROM portfolio")
    portfolio = load_json("portfolio")
    for i, p in enumerate(portfolio):
        conn.execute(
            "INSERT INTO portfolio (id, title, client, summary, challenge, solution, outcome, technologies, image, featured, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (p["id"], p["title"], p["client"], p["summary"], p["challenge"],
             p["solution"], p["outcome"], json.dumps(p["technologies"]),
             p.get("image", ""), 1 if p.get("featured") else 0, i),
        )

    # --- Team ---
    conn.execute("DELETE FROM team_members")
    team = load_json("team")
    for i, m in enumerate(team):
        conn.execute(
            "INSERT INTO team_members (id, name, role, photo, bio, social, sort_order) VALUES (?,?,?,?,?,?,?)",
            (m["id"], m["name"], m["role"], m.get("photo", ""), m["bio"],
             json.dumps(m["social"]), i),
        )

    # --- Testimonials ---
    conn.execute("DELETE FROM testimonials")
    testimonials = load_json("testimonials")
    for i, t in enumerate(testimonials):
        conn.execute(
            "INSERT INTO testimonials (id, quote, client_name, company, role, logo, approved, sort_order) VALUES (?,?,?,?,?,?,1,?)",
            (t["id"], t["quote"], t["clientName"], t["company"], t["role"],
             t.get("logo", ""), i),
        )

    # --- FAQ ---
    conn.execute("DELETE FROM faq")
    faq = load_json("faq")
    for i, f in enumerate(faq):
        conn.execute(
            "INSERT INTO faq (id, question, answer, sort_order) VALUES (?,?,?,?)",
            (f["id"], f["question"], f["answer"], i),
        )

    # --- Blog Articles (from data.ts) ---
    conn.execute("DELETE FROM blog_articles")
    blog_articles = [
        {
            "slug": "building-scalable-web-apps-nextjs",
            "title": "Building Scalable Web Applications with Next.js",
            "date": "2026-07-15",
            "author": "Alex Rivera",
            "excerpt": "Learn how Next.js and React Server Components help build performant, scalable web applications for modern businesses.",
            "content": "<p>Next.js has become the leading framework for building production-grade React applications. With the introduction of the App Router and React Server Components, it offers unprecedented performance and developer experience.</p><h3>Key Benefits</h3><ul><li><strong>Server Components by Default:</strong> Smaller client bundles, faster page loads</li><li><strong>Automatic Code Splitting:</strong> Only load what's needed</li><li><strong>Static & Dynamic Rendering:</strong> Choose the best strategy per route</li><li><strong>Built-in Optimizations:</strong> Image optimization, font loading, SEO</li></ul><p>At iotaDev, we've migrated multiple clients from legacy frameworks to Next.js, resulting in 40-60% faster page loads and significantly improved SEO rankings.</p>",
            "tags": ["Web Development", "Next.js", "React"],
            "featuredImage": "",
        },
        {
            "slug": "llms-transforming-enterprise-document-processing",
            "title": "How LLMs Are Transforming Enterprise Document Processing",
            "date": "2026-06-28",
            "author": "Marcus Johnson",
            "excerpt": "Discover how Large Language Models are revolutionizing how enterprises handle document processing at scale.",
            "content": "<p>Large Language Models (LLMs) have ushered in a new era of document processing. Unlike traditional OCR and rule-based systems, LLMs understand context, handle ambiguity, and adapt to new document types without extensive retraining.</p><h3>Real-World Applications</h3><ul><li><strong>Automated Data Extraction:</strong> Extract structured data from unstructured documents</li><li><strong>Intelligent Classification:</strong> Automatically categorize documents by content</li><li><strong>Compliance Checking:</strong> Verify documents against regulatory requirements</li></ul><p>Our clients have seen 85% reduction in manual document processing time after implementing LLM-powered solutions with our team.</p>",
            "tags": ["AI/ML", "LLM", "Document Processing"],
            "featuredImage": "",
        },
        {
            "slug": "cloud-migration-practical-guide",
            "title": "Cloud Migration: A Practical Guide for Enterprise Teams",
            "date": "2026-06-10",
            "author": "Priya Patel",
            "excerpt": "A practical, step-by-step guide to planning and executing a successful cloud migration strategy.",
            "content": "<p>Cloud migration is one of the most impactful technology decisions an organization can make. Done right, it unlocks scalability, cost savings, and innovation.</p><h3>Our Proven Framework</h3><ol><li><strong>Assessment:</strong> Audit your current infrastructure and dependencies</li><li><strong>Strategy:</strong> Choose the right migration approach</li><li><strong>Execution:</strong> Migrate in waves, validating each phase</li><li><strong>Optimization:</strong> Continuously monitor costs and performance</li></ol><p>Using this framework, we've helped enterprises migrate 200+ workloads with zero downtime and 40% cost reduction.</p>",
            "tags": ["Cloud", "Migration", "DevOps"],
            "featuredImage": "",
        },
    ]
    for i, a in enumerate(blog_articles):
        conn.execute(
            "INSERT INTO blog_articles (slug, title, date, author, excerpt, content, tags, featured_image, sort_order) VALUES (?,?,?,?,?,?,?,?,?)",
            (a["slug"], a["title"], a["date"], a["author"], a["excerpt"],
             a["content"], json.dumps(a["tags"]), a.get("featuredImage", ""), i),
        )

    conn.commit()
    conn.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed()
