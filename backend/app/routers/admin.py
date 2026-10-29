from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth import require_admin_auth
from app.database import get_db
from app.models import ContactMessage
from app.schemas import AdminMessagesListOut, ContactMessageAdminOut

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/messages", response_model=AdminMessagesListOut)
def list_contact_messages(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    _admin: str = Depends(require_admin_auth),
    db: Session = Depends(get_db),
) -> AdminMessagesListOut:
    total = db.execute(select(func.count(ContactMessage.id))).scalar_one()
    rows = (
        db.execute(
            select(ContactMessage)
            .order_by(ContactMessage.created_at.desc(), ContactMessage.id.desc())
            .limit(limit)
            .offset(offset)
        )
        .scalars()
        .all()
    )

    return AdminMessagesListOut(
        total=total,
        limit=limit,
        offset=offset,
        items=[ContactMessageAdminOut.model_validate(row) for row in rows],
    )
