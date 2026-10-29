from __future__ import annotations

import secrets
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBasic, HTTPBasicCredentials, HTTPBearer

from app.config import Settings, get_settings

bearer_scheme = HTTPBearer(auto_error=False)
basic_scheme = HTTPBasic(auto_error=False)


def require_admin_auth(
    bearer: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    basic: HTTPBasicCredentials | None = Depends(basic_scheme),
    x_admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
    settings: Settings = Depends(get_settings),
) -> str:
    """
    Protect admin endpoints using ADMIN_API_KEY via any standard auth header:
      - Authorization: Bearer <ADMIN_API_KEY>
      - X-Admin-Key: <ADMIN_API_KEY>
      - Authorization: Basic base64(admin:<ADMIN_API_KEY>)
    Uses constant-time comparison to prevent timing side-channels.
    """
    expected = (settings.admin_api_key or "").strip()
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin authentication is not configured on the server (ADMIN_API_KEY missing).",
        )

    candidate: str | None = None
    if bearer and bearer.credentials:
        candidate = bearer.credentials.strip()
    elif x_admin_key:
        candidate = x_admin_key.strip()
    elif basic and basic.password:
        candidate = basic.password.strip()

    if not candidate or not secrets.compare_digest(candidate.encode("utf-8"), expected.encode("utf-8")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin credentials.",
            headers={"WWW-Authenticate": 'Bearer realm="ErkinovLoyihasiAdmin"'},
        )

    return "admin"
