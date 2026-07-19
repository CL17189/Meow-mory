import csv

from sqlmodel import select

from backend.app.db.session import get_session
from backend.app.models.word import Word

CSV_PATH = "data/word_db_init.csv"


def main():
    with get_session() as session:
        with open(CSV_PATH, newline="", encoding="utf-8") as file:
            for row in csv.DictReader(file):
                language = row["lang"].strip().lower()
                exists = session.exec(select(Word).where(
                    Word.word_text == row["word_text"].strip().lower(),
                    Word.language == language,
                    Word.owner_user_id.is_(None),
                )).first()
                if exists:
                    continue
                session.add(Word(
                    word_id=int(row["word_id"]),
                    word_text=row["word_text"].strip().lower(),
                    language=language,
                    owner_user_id=None,
                ))
        session.commit()
        print("Words loaded.")


if __name__ == "__main__":
    main()
