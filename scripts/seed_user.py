# scripts/seed_users.py
from backend.app.db.session import get_session
from backend.app.models.user import User
from sqlmodel import select

def main():
    with get_session() as session:
        email = "test@meowmory.dev"

        user = session.exec(
            select(User).where(User.email == email)
        ).first()

        if not user:
            user = User(
                email=email,
                hashed_password="dev_only"
            )
            session.add(user)
            session.commit()

        print("User ready:", user.user_id)

if __name__ == "__main__":
    main()
