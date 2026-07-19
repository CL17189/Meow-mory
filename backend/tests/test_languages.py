def test_words_and_story_keep_language_labels(client, auth_headers):
    imported = client.post("/api/v1/words", headers=auth_headers, json={
        "language": "sv",
        "words": ["hus", "vänskap"],
    })
    assert imported.status_code == 200
    assert imported.json()["language"] == "sv"

    vocab = client.get("/api/v1/vocabularies/recent?language=sv", headers=auth_headers).json()
    assert vocab["items"][0]["language"] == "sv"
    assert "vänskap" in client.get("/api/v1/vocabularies/sv/words", headers=auth_headers).json()

    generated = client.post("/api/v1/stories/generate", headers=auth_headers, json={
        "language": "sv", "words": ["hus", "vänskap"], "difficulty": "A2", "style": "joke",
    })
    assert generated.status_code == 200
    assert generated.json()["language"] == "sv"
    story_id = generated.json()["story_id"]
    story_words = client.get(f"/api/v1/stories/{story_id}/words", headers=auth_headers).json()
    assert {item["language"] for item in story_words} == {"sv"}
