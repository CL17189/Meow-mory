from sqlmodel import select
from app.models.word import Word
from sqlmodel import Session


def import_words(session: Session, words: list[str], language: str):
    inserted = 0
    skipped = 0

    for w in words:
        w = w.strip().lower()
        if not w:
            skipped += 1
            continue

        exists = session.exec(
            select(Word).where(
                Word.word_text == w,
                Word.language == language,
            )
        ).first()

        if exists:
            skipped += 1
            continue

        session.add(Word(word_text=w, language=language))
        inserted += 1

    session.commit()

    return {
        "inserted": inserted,
        "skipped": skipped,
        "total": len(words),
    }
