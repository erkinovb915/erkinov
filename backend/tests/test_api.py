from __future__ import annotations

import os
import unittest
from fastapi.testclient import TestClient

# Ensure test uses existing DATABASE_URL and a known ADMIN_API_KEY
os.environ.setdefault(
    "ADMIN_API_KEY", "erkinov_admin_local_secret_9f8a7b6c5d4e3f2a1b"
)

from app.main import app  # noqa: E402
from app.config import get_settings  # noqa: E402


class PortfolioApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        get_settings.cache_clear()
        cls.settings = get_settings()
        cls.client_cm = TestClient(app)
        cls.client = cls.client_cm.__enter__()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.client_cm.__exit__(None, None, None)

    def test_01_health_endpoint(self) -> None:
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertEqual(body["status"], "healthy")
        self.assertEqual(body["database"], "connected")
        self.assertEqual(body["brand"], "ERKINOV LOYIHASI")

    def test_02_portfolio_endpoint_contains_exact_10_pages_and_2_projects(self) -> None:
        res = self.client.get("/api/portfolio")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["brand"], "ERKINOV LOYIHASI")
        self.assertEqual(data["owner"], "ERKINOV BOBURJON")
        self.assertEqual(data["back_cover_quote"], "DREAM BIG. BUILD DIFFERENT.")
        self.assertEqual(len(data["pages"]), 10)
        self.assertEqual(len(data["projects"]), 2)
        titles = [p["title"] for p in data["projects"]]
        self.assertEqual(titles, ["MoneyFlow", "SHERDOOR AKFA"])

    def test_03_projects_endpoints(self) -> None:
        res = self.client.get("/api/projects")
        self.assertEqual(res.status_code, 200)
        items = res.json()
        self.assertEqual(len(items), 2)

        first_id = items[0]["id"]
        by_id = self.client.get(f"/api/projects/{first_id}")
        self.assertEqual(by_id.status_code, 200)
        self.assertEqual(by_id.json()["title"], "MoneyFlow")
        self.assertEqual(
            by_id.json()["live_url"], "https://moneyflow-website.netlify.app"
        )

        by_slug = self.client.get("/api/projects/sherdoor-akfa")
        self.assertEqual(by_slug.status_code, 200)
        self.assertEqual(by_slug.json()["title"], "SHERDOOR AKFA")

        missing = self.client.get("/api/projects/999999")
        self.assertEqual(missing.status_code, 404)

    def test_04_contact_validation_and_persistence_and_admin_protection(self) -> None:
        # Invalid email should fail with 422
        bad = self.client.post(
            "/api/contact",
            json={
                "name": "Test Visitor",
                "email": "not-an-email",
                "message": "This should be rejected by Pydantic validation.",
            },
        )
        self.assertEqual(bad.status_code, 422)

        # Valid contact message should save to PostgreSQL and return 201
        good = self.client.post(
            "/api/contact",
            json={
                "name": "Verification Bot",
                "email": "verify@example.com",
                "subject": "Integration Check",
                "telegram_handle": "@verify_bot",
                "message": "Testing PostgreSQL persistence for ERKINOV LOYIHASI.",
            },
        )
        self.assertEqual(good.status_code, 201)
        saved = good.json()
        self.assertTrue(saved["confirmed"])
        self.assertEqual(saved["status"], "saved")
        self.assertIsInstance(saved["id"], int)

        # Unauthenticated admin call must return 401
        unauth = self.client.get("/api/admin/messages")
        self.assertEqual(unauth.status_code, 401)

        # Wrong key must return 401
        wrong = self.client.get(
            "/api/admin/messages", headers={"Authorization": "Bearer wrong_key"}
        )
        self.assertEqual(wrong.status_code, 401)

        # Authorized admin call must return 200 and include our saved message
        auth = self.client.get(
            "/api/admin/messages",
            headers={"Authorization": f"Bearer {self.settings.admin_api_key}"},
        )
        self.assertEqual(auth.status_code, 200)
        admin_data = auth.json()
        self.assertGreaterEqual(admin_data["total"], 1)
        ids = [item["id"] for item in admin_data["items"]]
        self.assertIn(saved["id"], ids)


if __name__ == "__main__":
    unittest.main()
