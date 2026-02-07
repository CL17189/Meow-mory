# backend/app/agents/tools.py
from typing import List, Optional
import re

try:
    import spacy
    _SPACY_AVAILABLE = True
    _NLP_EN = spacy.load("en_core_web_sm", disable=["parser", "ner"])
except Exception:
    _SPACY_AVAILABLE = False
    _NLP_EN = None


def _basic_tokens(text: str) -> List[str]:
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return text.split()


def _english_lemmas(text: str) -> set[str]:
    doc = _NLP_EN(text)
    return {t.lemma_ for t in doc if t.is_alpha}


def word_count_checker(
    text: str,
    word_list: List[str],
    language: Optional[str] = "auto",
) -> bool:
    """
    Language-aware word usage checker with graceful degradation.
    """

    if not word_list:
        return True

    tokens = _basic_tokens(text)
    token_set = set(tokens)

    # --- English: lemmatization if available ---
    if language == "en" and _SPACY_AVAILABLE:
        lemmas = _english_lemmas(text)
        for w in word_list:
            w = w.lower()
            if w not in token_set and w not in lemmas:
                return False
        return True

    # --- CJK / unknown languages: substring match ---
    for w in word_list:
        if w.lower() not in text.lower():
            return False

    return True
