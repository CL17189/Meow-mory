# scripts/seed_stories.py
from backend.app.db.session import get_session
from backend.app.models import Story, Word, StoryWord, User
from sqlmodel import select

def main():
    with get_session() as session:
        words = session.exec(select(Word).limit(5)).all()
        if not words:
            print("No words found")
            return
        
        user=session.exec(select(User).limit(1)).first()
        if not user:
            print("No user found")
            return

        story = Story(
            language="en",
            user_id=user.user_id,
            content="I ett litet hus i en stor stad bor en människa som älskar böcker. Varje morgon dricker hen vatten och tittar på solen innan arbetet börjar. Hen värdesätter sin tid och delar gärna mat med en vän.",
            word_count=len(words)
        )
        session.add(story)
        session.commit()
        session.refresh(story)

        for w in words:
            session.add(
                StoryWord(story_id=story.story_id, word_id=w.word_id)
            )

        session.commit()
        print("Story seeded:", story.story_id)

if __name__ == "__main__":
    main()
