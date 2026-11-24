"""
End-to-End integration test for the authenticated student NLP flow.
"""

from fastapi.testclient import TestClient

from main import app
from db.database import database_engine, DatabaseModelBase

client = TestClient(app)


def setup_module():
    """Ensure database tables exist for integration tests."""
    DatabaseModelBase.metadata.create_all(bind=database_engine)


def test_student_nlp_authenticated_end_to_end():
    """
    Test student registration, login, and requesting supportive message
    using the Authorization Bearer token header.
    """
    email = "integration_test_student@juet.ac.in"
    password = "StrongPassword123!"

    # 1. Register or ignore if already registered
    reg_resp = client.post(
        "/api/auth/register",
        json={"name": "Integration Student", "email": email, "password": password}
    )
    assert reg_resp.status_code in [201, 409]

    # 2. Login to get access token
    login_resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": password}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    assert token is not None

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Request NLP support as authenticated student
    support_payload = {
        "text": (
            "I'm feeling really stressed about upcoming midterm evaluations and finding it hard "
            "to concentrate during evening study sessions."
        )
    }
    nlp_resp = client.post("/api/nlp/support", json=support_payload, headers=headers)
    assert nlp_resp.status_code == 200
    data = nlp_resp.json()
    assert data["is_crisis"] is False
    assert len(data["supportive_message"]) > 80
    assert "disclaimer" in data
    # Sensitive text must not be stored in database
    # Check that assessment_results table doesn't have student text
    with database_engine.connect() as conn:
        result = conn.exec_driver_sql("SELECT COUNT(*) FROM assessment_results WHERE assessment_type = 'nlp'").fetchone()
        assert result[0] == 0


def test_crisis_intervention_flow_authenticated():
    """
    Test crisis detection on authenticated request.
    Verifies crisis guidance, 24/7 helplines, and compassionate message are returned.
    """
    email = "integration_test_student@juet.ac.in"
    password = "StrongPassword123!"

    login_resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": password}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    crisis_payload = {
        "text": "I feel hopeless, like I want to die and end it all."
    }
    resp = client.post("/api/nlp/support", json=crisis_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_crisis"] is True
    assert data["crisis_guidance"] is not None
    assert len(data["crisis_resources"]) >= 2
    # Check verified helpline
    assert any("14416" in r["contact"] for r in data["crisis_resources"])
