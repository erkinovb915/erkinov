from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project
from app.schemas import ProjectOut

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)) -> list[ProjectOut]:
    projects = (
        db.execute(select(Project).order_by(Project.display_order.asc(), Project.id.asc()))
        .scalars()
        .all()
    )
    return [ProjectOut.model_validate(proj) for proj in projects]


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)) -> ProjectOut:
    query = select(Project)
    if project_id.isdigit():
        query = query.where(Project.id == int(project_id))
    else:
        query = query.where(Project.slug == project_id.strip().lower())

    project = db.execute(query).scalar_one_or_none()
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project '{project_id}' not found.",
        )

    return ProjectOut.model_validate(project)
