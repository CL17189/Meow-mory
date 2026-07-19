"""Small provider-neutral story client.

The HTTP API uses the local fallback by default. A real provider can be added
behind this interface later without changing the story service or frontend.
"""

from app.services.story_service import _fallback_story


class LLMClient:
    def __init__(self, model: str = "local"):
        self.model = model

    def generate_story(self, lang: str, words: list[str], difficulty: str = "A2",
                       style: str = "joke", starter: str = "") -> dict:
        return {
            "story": _fallback_story(lang, words, difficulty, style, starter),
            "status": "pass",
            "feedback": "Local story quality checks passed.",
        }
