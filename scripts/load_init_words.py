# scripts/load_initial_words.py
import csv
from backend.app.db.session import get_session
from backend.app.models.word import Word
from sqlmodel import select

CSV_PATH = "data/word_db_init.csv"

def main():
    with get_session() as session:
        with open(CSV_PATH, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                print("!!!!!!!!!")
                print(f"Adding word: {row['word_text']} ({row['lang']})")
                exists = session.exec(
                    select(Word).where(
                        Word.word_text == row["word_text"],
                        Word.language == row["lang"]
                    )
                ).first()

                if exists:
                    continue
                
                
                word = Word(
                    word_id=row["word_id"],
                    word_text=row["word_text"],
                    language=row["lang"]
                )
                session.add(word)

        session.commit()
        print("Words loaded.")

if __name__ == "__main__":
    main()
