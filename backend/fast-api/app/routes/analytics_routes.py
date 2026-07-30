from fastapi import APIRouter
from app.controllers.analytics_controller import analytics_controller
from app.models.schemas import AnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/metrics", response_model=AnalyticsResponse)
async def get_metrics():
    return analytics_controller.get_analytics_data()
