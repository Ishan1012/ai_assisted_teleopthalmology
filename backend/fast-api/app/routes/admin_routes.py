from fastapi import APIRouter, UploadFile, File, Form, Depends, Query
from typing import Optional
from app.controllers.admin_controller import admin_controller
from app.models.schemas import IngestResponse
from app.core.security import verify_internal_secret

router = APIRouter(
    prefix="/admin",
    tags=["Knowledge Base Ingestion"],
    dependencies=[Depends(verify_internal_secret)]
)

@router.post("/ingest", response_model=IngestResponse)
async def ingest_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None)
):
    """
    Ingests clinical PDF or TXT guidelines into MongoDB Atlas vector collection.
    Chunks text, calculates embeddings with text-embedding-004, and stores vectors.
    """
    return await admin_controller.ingest_document(file=file, title=title or "")
