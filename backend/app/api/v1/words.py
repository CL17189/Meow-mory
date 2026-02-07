from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from app.services.word_service import import_words
from app.db.session import get_session
from fastapi import Depends
from sqlmodel import Session
router = APIRouter(prefix="/words", tags=["words"])

class WordImportRequest(BaseModel):
    language: Optional[str] = None
    words: List[str]


class WordImportResponse(BaseModel):
    inserted: int
    skipped: int
    total: int

@router.post("", response_model=WordImportResponse)
def import_words_api(
    payload: WordImportRequest,
    session: Session = Depends(get_session),
):
    result = import_words(
        session=session,
        words=payload.words,
        language=payload.language or "en",
    )
    return WordImportResponse(**result)

