# iotaDev

Corporate website and API for iotaDev — a software house specializing in AI, web, and mobile solutions.

## Tech Stack

| Layer    | Technology                                        |
| -------- | ------------------------------------------------- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4  |
| Backend  | FastAPI, Python 3, SQLite                         |
| Database | SQLite (local), managed via raw SQL + seed script  |

## Project Structure

```
iotaDev/
├── software-house-website-v2/
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── data/          # JSON seed data (services, portfolio, team, etc.)
│   │   └── lib/           # API client, types, data helpers
│   ├── public/            # Static assets
│   ├── backend/           # FastAPI backend
│   │   ├── main.py        # API server
│   │   ├── database.py    # DB init & helpers
│   │   ├── seed.py        # Seed script (loads JSON → SQLite)
│   │   ├── .env.example   # Environment variables template
│   │   └── requirements.txt
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18
- Python >= 3.11
- npm or yarn

### 1. Frontend

```bash
cd software-house-website-v2
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### 2. Backend

```bash
cd software-house-website-v2/backend
python -m venv .venv
.\.venv\Scripts\activate     # Windows
# source .venv/bin/activate  # macOS / Linux
pip install -r requirements.txt
cp .env.example .env         # then edit .env with your SMTP settings
uvicorn main:app --reload --port 8000
```

Runs at [http://localhost:8000](http://localhost:8000).

### 3. Seed the database

```bash
cd software-house-website-v2/backend
python seed.py
```

### Environment Variables (`.env`)

| Variable         | Description                        |
| ---------------- | ---------------------------------- |
| `SMTP_HOST`      | SMTP server host                   |
| `SMTP_PORT`      | SMTP server port                   |
| `SMTP_USER`      | SMTP username / email              |
| `SMTP_PASSWORD`  | SMTP password                      |
| `CONTACT_EMAIL`  | Where contact form submissions go  |

## Available Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start Next.js dev server           |
| `npm run build`      | Build for production               |
| `npm run start`      | Start production server            |
| `npm run lint`       | Run ESLint                         |
| `uvicorn main:app`   | Start FastAPI backend              |
| `python seed.py`     | Seed SQLite database from JSON     |

## API Endpoints

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ------------------------ |
| GET    | `/api/health`          | Health check             |
| GET    | `/api/services`        | List all services        |
| GET    | `/api/services/{id}`   | Single service + subs    |
| GET    | `/api/portfolio`       | Portfolio items          |
| GET    | `/api/team`            | Team members             |
| GET    | `/api/testimonials`    | Testimonials             |
| GET    | `/api/faq`             | FAQ items                |
| GET    | `/api/blog`            | Blog articles            |
| POST   | `/api/contact`         | Submit contact form      |
