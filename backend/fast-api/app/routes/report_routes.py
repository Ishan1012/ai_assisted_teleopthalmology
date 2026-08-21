from fastapi import APIRouter, Depends
from app.controllers.report_controller import report_controller
from app.models.schemas import ReportRequest, ClinicalReportResponse
from app.core.security import verify_internal_secret

router = APIRouter(
    prefix="/screening",
    tags=["Clinical Report"],
    dependencies=[Depends(verify_internal_secret)]
)

@router.post("/report", response_model=ClinicalReportResponse)
async def generate_clinical_report(request: ReportRequest):
    """
    RAG-Augmented Clinical Decision Support Report Generation.
    Retrieves relevant ophthalmic guideline chunks from MongoDB Atlas
    and generates a clinician-grade diagnostic report using Gemini LLM.
    """
    return await report_controller.generate_report(request)
