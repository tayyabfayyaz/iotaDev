import os

from dotenv import load_dotenv
import psycopg
from psycopg.rows import dict_row

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

TABLES = [
    """
    CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        tagline TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        technologies TEXT NOT NULL,
        features TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS sub_services (
        id TEXT PRIMARY KEY,
        service_id TEXT NOT NULL REFERENCES services(id),
        title TEXT NOT NULL,
        tagline TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        image TEXT,
        key_points TEXT NOT NULL,
        technologies TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS portfolio (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        client TEXT NOT NULL,
        summary TEXT NOT NULL,
        challenge TEXT NOT NULL,
        solution TEXT NOT NULL,
        outcome TEXT NOT NULL,
        technologies TEXT NOT NULL,
        image TEXT,
        featured INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        photo TEXT,
        bio TEXT NOT NULL,
        social TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS testimonials (
        id TEXT PRIMARY KEY,
        quote TEXT NOT NULL,
        client_name TEXT NOT NULL,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        logo TEXT,
        approved INTEGER DEFAULT 0,
        timestamp TEXT,
        sort_order INTEGER DEFAULT 0
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS faq (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS blog_articles (
        slug TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        author TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT NOT NULL,
        featured_image TEXT,
        sort_order INTEGER DEFAULT 0
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        service TEXT,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """,
]


def get_connection():
    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL is not set. Add your Supabase Postgres connection string to backend/.env"
        )
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)


def init_db():
    try:
        conn = get_connection()
        try:
            for stmt in TABLES:
                conn.execute(stmt)
            conn.commit()
        finally:
            conn.close()
    except Exception as e:
        print(f"[database] Could not initialize Supabase database: {e}")


def fetch_all(conn, table: str, order: str = "sort_order") -> list[dict]:
    rows = conn.execute(f"SELECT * FROM {table} ORDER BY {order}").fetchall()
    return [dict(r) for r in rows]


def fetch_one(conn, table: str, id_col: str, id_val: str) -> dict | None:
    row = conn.execute(f"SELECT * FROM {table} WHERE {id_col} = %s", (id_val,)).fetchone()
    return dict(row) if row else None
