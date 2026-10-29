from __future__ import annotations

import re
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def _clean_text(value: str) -> str:
    return CONTROL_CHARS_RE.sub("", value).strip()


class HealthResponse(BaseModel):
    status: str
    database: str
    service: str
    brand: str
    timestamp: datetime


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    subtitle: str
    category: str
    summary: str
    description: str
    technologies: list[str]
    features: list[str]
    live_url: str | None = None
    repo_url: str | None = None
    status: str
    book_page: int
    display_order: int
    created_at: datetime
    updated_at: datetime


class SocialLinksOut(BaseModel):
    telegram: str
    instagram: str
    email_placeholder: str
    github_placeholder: str


class BookPageMeta(BaseModel):
    page: int
    slug: str
    title: str
    subtitle: str


class PortfolioOut(BaseModel):
    brand: str
    owner: str
    tagline: str
    back_cover_quote: str
    about: list[str]
    skills: list[str]
    technologies: dict[str, list[str]]
    journey: list[dict[str, str]]
    socials: SocialLinksOut
    pages: list[BookPageMeta]
    projects: list[ProjectOut]


class ContactMessageCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    subject: str | None = Field(default=None, max_length=200)
    telegram_handle: str | None = Field(default=None, max_length=100)
    message: str = Field(..., min_length=10, max_length=5000)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = _clean_text(value)
        if len(cleaned) < 2:
            raise ValueError("Name must contain at least 2 characters.")
        return cleaned

    @field_validator("subject", "telegram_handle")
    @classmethod
    def validate_optional_fields(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = _clean_text(value)
        return cleaned or None

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        cleaned = _clean_text(value)
        if len(cleaned) < 10:
            raise ValueError("Message must contain at least 10 characters.")
        return cleaned


class ContactSubmissionConfirmation(BaseModel):
    confirmed: bool = True
    status: str = "saved"
    id: int
    created_at: datetime
    message: str


class ContactMessageAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    subject: str | None = None
    telegram_handle: str | None = None
    message: str
    is_read: bool
    created_at: datetime


class AdminMessagesListOut(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[ContactMessageAdminOut]
