from __future__ import annotations

import logging
from sqlalchemy import select, delete
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Project

logger = logging.getLogger(__name__)

CANONICAL_PROJECTS: list[dict] = [
    {
        "slug": "moneyflow",
        "title": "MoneyFlow",
        "subtitle": "Personal Finance Telegram Bot & Companion Web Platform",
        "category": "FinTech & Telegram Automation",
        "summary": (
            "A personal finance Telegram bot paired with a live web companion for "
            "frictionless income and expense tracking, category insights, and clear financial control."
        ),
        "description": (
            "MoneyFlow streamlines personal financial management directly inside Telegram where daily "
            "decisions happen. Users log income and expenses in seconds via structured bot commands and "
            "interactive inline menus, organize transactions across custom categories, monitor balance "
            "trends, and explore a dedicated companion web experience deployed on Netlify."
        ),
        "technologies": [
            "Python",
            "Telegram Bots",
            "JavaScript",
            "React",
            "HTML",
            "CSS",
            "Git/GitHub",
        ],
        "features": [
            "Fast income & expense logging directly inside Telegram",
            "Category-based spending breakdowns and balance summaries",
            "Interactive inline keyboards for effortless mobile workflows",
            "Live companion web interface hosted at moneyflow-website.netlify.app",
        ],
        "live_url": "https://moneyflow-website.netlify.app",
        "repo_url": None,
        "status": "Live",
        "book_page": 5,
        "display_order": 1,
    },
    {
        "slug": "sherdoor-akfa",
        "title": "SHERDOOR AKFA",
        "subtitle": "Employee Attendance Telegram Bot",
        "category": "Workforce & Operations Automation",
        "summary": (
            "An automated employee attendance Telegram bot built for SHERDOOR AKFA to record "
            "check-ins, check-outs, and daily shift attendance cleanly in real time."
        ),
        "description": (
            "SHERDOOR AKFA digitizes workforce attendance tracking through an intuitive Telegram bot "
            "interface. Employees register arrival and departure events right from their phones, while "
            "administrators receive structured, timestamped attendance records and daily operational visibility "
            "without manual paper logs."
        ),
        "technologies": [
            "Python",
            "Telegram Bots",
            "PostgreSQL",
            "Git/GitHub",
        ],
        "features": [
            "One-tap employee check-in and check-out inside Telegram",
            "Accurate server-side timestamping for daily shift logs",
            "Real-time attendance status visibility for supervisors",
            "Structured attendance history eliminating manual paper sheets",
        ],
        "live_url": None,
        "repo_url": None,
        "status": "Production",
        "book_page": 6,
        "display_order": 2,
    },
]


def seed_projects(db: Session) -> list[Project]:
    """
    Idempotently seed ONLY MoneyFlow and SHERDOOR AKFA without creating duplicates.
    Updates existing records in-place if already present and removes any non-canonical slugs.
    """
    allowed_slugs = {item["slug"] for item in CANONICAL_PROJECTS}
    db.execute(delete(Project).where(Project.slug.notin_(allowed_slugs)))

    seeded: list[Project] = []
    for data in CANONICAL_PROJECTS:
        existing = db.execute(
            select(Project).where(
                (Project.slug == data["slug"]) | (Project.title == data["title"])
            )
        ).scalar_one_or_none()

        if existing is None:
            project = Project(**data)
            db.add(project)
            seeded.append(project)
        else:
            for key, value in data.items():
                setattr(existing, key, value)
            seeded.append(existing)

    db.commit()
    for proj in seeded:
        db.refresh(proj)

    logger.info("Seeded %d canonical portfolio projects cleanly.", len(seeded))
    return seeded


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    with SessionLocal() as session:
        projects = seed_projects(session)
        for p in projects:
            print(f"[{p.id}] {p.title} ({p.slug}) -> page {p.book_page}")
