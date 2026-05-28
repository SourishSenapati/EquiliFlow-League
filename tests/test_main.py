import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from main import app, db

client = TestClient(app)

def test_api_status():
    response = client.get("/api/v1/status")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_api_db_state():
    response = client.get("/api/v1/db/state")
    assert response.status_code == 200
    assert "user" in response.json()

def test_api_user_profile():
    response = client.get("/api/v1/user/profile")
    assert response.status_code == 200
    assert "name" in response.json()

def test_api_user_upgrade():
    response = client.post("/api/v1/user/upgrade")
    assert response.status_code == 200
    assert db.data["user"]["is_pro"] is True

def test_api_checkpoint():
    response = client.post("/api/v1/simulation/checkpoint?mission_id=mission_1")
    assert response.status_code == 200
    assert "mission_1" in db.data["checkpoints"]

def test_api_assets():
    response = client.get("/api/v1/assets/registry")
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_api_reset():
    response = client.post("/api/v1/simulation/reset")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
