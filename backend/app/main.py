from fastapi import FastAPI
from app.api.v1 import words, stories
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(words.router, prefix="/api/v1")
app.include_router(stories.router, prefix="/api/v1")