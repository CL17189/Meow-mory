from sqlmodel import SQLModel
from .session import engine
from app.models import *

def init_db():
    SQLModel.metadata.create_all(engine)
