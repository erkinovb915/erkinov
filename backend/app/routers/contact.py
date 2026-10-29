from __future__ import annotations

import hashlib
import json
import logging
import urllib.error
import urllib.request
from datetime import datetime
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import ContactMessage
from app.schemas import ContactMessageCreate, ContactSubmissionConfirmation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/contact", tags=["Contact"])


def send_telegram_notification(
    msg_id: int,
    name: str,
    email: str,
    telegram_handle: str | None,
    subject: str | None,
    message: str,
    created_at: datetime,
) -> None:
    """Send instant Telegram notification to owner when TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID are set."""
    settings = get_settings()
    token = (settings.telegram_bot_token or "").strip()
    chat_id = (settings.telegram_chat_id or "").strip()

    if not token or not chat_id:
        return

    lines = [
        f"📩 YANGI PORTFOLIO XABARI (#{msg_id})",
        "━━━━━━━━━━━━━━━━━━━━",
        f"👤 Ism: {name}",
        f"📧 Email: {email}",
    ]
    if telegram_handle:
        lines.append(f"💬 Telegram: {telegram_handle}")
    if subject:
        lines.append(f"📌 Mavzu: {subject}")
    lines.extend(
        [
            "",
            "📝 Xabar:",
            message,
            "",
            f"🕒 Vaqt (UTC): {created_at.strftime('%Y-%m-%d %H:%M:%S')}",
        ]
    )

    payload = json.dumps(
        {
            "chat_id": chat_id,
            "text": "\n".join(lines),
            "disable_web_page_preview": True,
        }
    ).encode("utf-8")

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            resp.read()
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        logger.warning("Telegram notification delivery failed for message #%s: %s", msg_id, exc)


@router.post(
    "",
    response_model=ContactSubmissionConfirmation,
    status_code=status.HTTP_201_CREATED,
)
def submit_contact_message(
    payload: ContactMessageCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> ContactSubmissionConfirmation:
    client_host = request.client.host if request.client else ""
    ip_hash = (
        hashlib.sha256(client_host.encode("utf-8")).hexdigest() if client_host else None
    )

    record = ContactMessage(
        name=payload.name,
        email=str(payload.email).lower(),
        subject=payload.subject,
        telegram_handle=payload.telegram_handle,
        message=payload.message,
        ip_hash=ip_hash,
    )

    try:
        db.add(record)
        db.commit()
        db.refresh(record)
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Failed to persist contact message to PostgreSQL.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not save message to PostgreSQL database. Please try again later.",
        ) from exc

    if not record.id or not record.created_at:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database write could not be confirmed.",
        )

    background_tasks.add_task(
        send_telegram_notification,
        record.id,
        record.name,
        record.email,
        record.telegram_handle,
        record.subject,
        record.message,
        record.created_at,
    )

    return ContactSubmissionConfirmation(
        confirmed=True,
        status="saved",
        id=record.id,
        created_at=record.created_at,
        message="Message verified and saved to PostgreSQL.",
    )
