import logging
from fastapi import HTTPException
from app.models.schemas import ReportRequest, ClinicalReportResponse
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)

class ReportController:
    async def generate_report(self, request: ReportRequest) -> ClinicalReportResponse:
        try:
            return rag_service.generate_clinical_report(request)
        except Exception as e:
            logger.error("Failed to generate clinical report: %s", e, exc_info=True)
            raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")

report_controller = ReportController()
