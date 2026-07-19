def test_register_login_and_me(client):
    registered = client.post("/api/v1/auth/register", json={
        "email": "new@example.com",
        "password": "correct-horse-battery",
        "display_name": "New Learner",
    })
    assert registered.status_code == 201
    token = registered.json()["access_token"]

    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "new@example.com"

    logged_in = client.post("/api/v1/auth/login", json={
        "email": "new@example.com",
        "password": "correct-horse-battery",
    })
    assert logged_in.status_code == 200

    updated = client.patch("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}, json={
        "display_name": "Updated Learner",
        "preferred_language": "zh",
    })
    assert updated.status_code == 200
    assert updated.json()["display_name"] == "Updated Learner"
    assert updated.json()["preferred_language"] == "zh"


def test_user_data_isolated(client):
    first = client.post("/api/v1/auth/register", json={"email": "first@example.com", "password": "correct-horse-battery"}).json()
    second = client.post("/api/v1/auth/register", json={"email": "second@example.com", "password": "correct-horse-battery"}).json()
    first_headers = {"Authorization": f"Bearer {first['access_token']}"}
    second_headers = {"Authorization": f"Bearer {second['access_token']}"}

    created = client.post("/api/v1/stories/generate", headers=first_headers, json={
        "language": "en", "words": ["privateword"], "difficulty": "A2", "style": "joke",
    })
    story_id = created.json()["story_id"]
    assert client.get(f"/api/v1/stories/{story_id}", headers=second_headers).status_code == 404
    assert client.get("/api/v1/stories", headers=second_headers).json()["total"] == 0
