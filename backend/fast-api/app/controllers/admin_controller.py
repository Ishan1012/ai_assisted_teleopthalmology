import logging
from fastapi import UploadFile, HTTPException
from app.models.schemas import IngestResponse
from app.services.ingestion_service import ingestion_service

logger = logging.getLogger(__name__)

class AdminController:
    async def ingest_document(self, file: UploadFile, title: str = "") -> IngestResponse:
        filename = file.filename or "document.pdf"
        try:
            content = await file.read()
            if not content:
                raise HTTPException(status_code=400, detail="Uploaded file is empty.")

            chunks_count, message = ingestion_service.ingest_document(
                file_bytes=content,
                filename=filename,
                title=title
            )

            return IngestResponse(
                filename=filename,
                chunks_ingested=chunks_count,
                status="success",
                message=message
            )
        except HTTPException:
            raise
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error("Failed to ingest document %s: %s", filename, e, exc_info=True)
            raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

admin_controller = AdminController()
