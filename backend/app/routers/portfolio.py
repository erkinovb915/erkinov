from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project
from app.schemas import BookPageMeta, PortfolioOut, ProjectOut, SocialLinksOut

router = APIRouter(prefix="/api", tags=["Portfolio"])


BOOK_PAGES_META: list[dict] = [
    {"page": 1, "slug": "cover", "title": "ERKINOV BOBURJON", "subtitle": "ERKINOV LOYIHASI — Front Cover"},
    {"page": 2, "slug": "about", "title": "About Me", "subtitle": "Developer Profile & Vision"},
    {"page": 3, "slug": "skills", "title": "Skills", "subtitle": "Core Engineering Capabilities"},
    {"page": 4, "slug": "journey", "title": "My Journey", "subtitle": "Technical Evolution & Craft"},
    {"page": 5, "slug": "moneyflow", "title": "MoneyFlow", "subtitle": "Personal Finance Telegram Bot"},
    {"page": 6, "slug": "sherdoor-akfa", "title": "SHERDOOR AKFA", "subtitle": "Employee Attendance Telegram Bot"},
    {"page": 7, "slug": "technologies", "title": "Technologies", "subtitle": "Full-Stack & 3D Ecosystem"},
    {"page": 8, "slug": "projects", "title": "Projects", "subtitle": "MoneyFlow & SHERDOOR AKFA"},
    {"page": 9, "slug": "contact", "title": "Contact", "subtitle": "Direct Channels & Message Dispatch"},
    {"page": 10, "slug": "back-cover", "title": "Back Cover", "subtitle": "DREAM BIG. BUILD DIFFERENT."},
]


@router.get("/portfolio", response_model=PortfolioOut)
def get_portfolio(db: Session = Depends(get_db)) -> PortfolioOut:
    projects = (
        db.execute(select(Project).order_by(Project.display_order.asc(), Project.id.asc()))
        .scalars()
        .all()
    )

    return PortfolioOut(
        brand="ERKINOV LOYIHASI",
        owner="ERKINOV BOBURJON",
        tagline="Interactive 3D Web Experiences, Modern Frontend & Python Telegram Bot Engineering",
        back_cover_quote="DREAM BIG. BUILD DIFFERENT.",
        about=[
            "I am Erkinov Boburjon, creator of ERKINOV LOYIHASI — focused on building modern interactive web interfaces, immersive 3D experiences, and reliable Python Telegram bots.",
            "Every project combines clean architecture with practical utility: from personal finance automation with MoneyFlow to real-time employee attendance tracking for SHERDOOR AKFA.",
        ],
        skills=[
            "HTML",
            "CSS",
            "JavaScript",
            "React",
            "Python",
            "Three.js",
            "Telegram Bots",
            "Git/GitHub",
        ],
        technologies={
            "Frontend & 3D": [
                "HTML",
                "CSS",
                "JavaScript",
                "React",
                "Vite",
                "Three.js",
                "React Three Fiber",
                "GSAP",
            ],
            "Backend & Automation": [
                "Python",
                "FastAPI",
                "Telegram Bots",
                "SQLAlchemy",
                "Pydantic",
            ],
            "Data & Workflow": [
                "PostgreSQL",
                "Alembic",
                "Git/GitHub",
                "Netlify",
            ],
        },
        journey=[
            {
                "phase": "01",
                "title": "Core Web Foundations",
                "detail": "Built responsive, accessible layouts and interactive browser fundamentals using HTML, CSS, JavaScript, and Git/GitHub.",
            },
            {
                "phase": "02",
                "title": "Modern React & 3D Web",
                "detail": "Expanded into component-driven React applications and spatial 3D interfaces powered by Three.js and smooth motion design.",
            },
            {
                "phase": "03",
                "title": "Python & Telegram Automation",
                "detail": "Engineered structured Python backends and custom Telegram bots designed for fast, mobile-native daily workflows.",
            },
            {
                "phase": "04",
                "title": "ERKINOV LOYIHASI Production Releases",
                "detail": "Delivered MoneyFlow (personal finance Telegram bot + web companion) and SHERDOOR AKFA (employee attendance Telegram bot).",
            },
        ],
        socials=SocialLinksOut(
            telegram="https://t.me/Erkinov_1105",
            instagram="https://www.instagram.com/Erkinov_neww/",
            email_placeholder="your.email@example.com",
            github_placeholder="https://github.com/your-username",
        ),
        pages=[BookPageMeta(**item) for item in BOOK_PAGES_META],
        projects=[ProjectOut.model_validate(proj) for proj in projects],
    )
