def test_generate_story(client):
    payload = {
        "language": "en",
        "words": ["water", "book"],
        "wordcount": 2,
        "difficulty": "B1",
        "style": "fantasy",
        "startwith": "Once upon a time",
    }

    response = client.post("/api/v1/stories/generate", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert "story_id" in data
    assert data["language"] == "en"
    assert "content" in data
    assert data["word_count"] > 0
    assert "created_at" in data


def test_list_stories_filter_by_language(client):
    payload = {
        "language": "en",
        "words": ["water", "book"],
        "wordcount": 2,
        "difficulty": "B1",
        "style": "fantasy",
        "startwith": "Once upon a time",
    }
    client.post(
        "/api/v1/stories/generate",
        json=payload,
    )

    response = client.get("/api/v1/stories?language=en")

    data = response.json()
    print(data)

    assert data["total"] >= 1
    assert data["items"][0]["language"] == "en"
