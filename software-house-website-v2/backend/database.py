import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).parent / "data.db"

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    conn = get_connection()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS services (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            tagline TEXT NOT NULL,
            description TEXT NOT NULL,
            icon TEXT NOT NULL,
            technologies TEXT NOT NULL,
            features TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0
        );

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
        );

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
        );

        CREATE TABLE IF NOT EXISTS team_members (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            photo TEXT,
            bio TEXT NOT NULL,
            social TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS testimonials (
            id TEXT PRIMARY KEY,
            quote TEXT NOT NULL,
            client_name TEXT NOT NULL,
            company TEXT NOT NULL,
            role TEXT NOT NULL,
            logo TEXT,
            sort_order INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS faq (
            id TEXT PRIMARY KEY,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0
        );

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
        );

        CREATE TABLE IF NOT EXISTS contact_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            service TEXT,
            message TEXT NOT NULL,
            timestamp TEXT NOT NULL
        );
    """)
    conn.commit()
    conn.close()

def fetch_all(conn: sqlite3.Connection, table: str, order: str = "sort_order") -> list[dict]:
    rows = conn.execute(f"SELECT * FROM {table} ORDER BY {order}").fetchall()
    return [dict(r) for r in rows]

def fetch_one(conn: sqlite3.Connection, table: str, id_col: str, id_val: str) -> dict | None:
    row = conn.execute(f"SELECT * FROM {table} WHERE {id_col} = ?", (id_val,)).fetchone()
    return dict(row) if row else None
