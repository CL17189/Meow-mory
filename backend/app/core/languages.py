import re

DEFAULT_LANGUAGE = "en"
SUPPORTED_LANGUAGES = {
    "en": "English",
    "zh": "中文",
    "sv": "Svenska",
    "ja": "日本語",
    "ko": "한국어",
    "fr": "Français",
    "de": "Deutsch",
    "es": "Español",
}


def normalize_language(value: str | None, default: str = DEFAULT_LANGUAGE) -> str:
    language = (value or default).strip().lower().replace("_", "-")
    if not re.fullmatch(r"[a-z]{2,3}(?:-[a-z]{2,4})?", language):
        raise ValueError("language must be a valid language tag such as en, zh, or sv")
    return language
