from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.controllers.screening_controller import screening_controller
from app.models.schemas import ScreeningResponse
from app.core.security import verify_internal_secret

router = APIRouter(
    prefix="/screening",
    tags=["Screening"],
    dependencies=[Depends(verify_internal_secret)]
)

@router.post("/screen", response_model=ScreeningResponse)
@router.post("/predict", response_model=ScreeningResponse)
async def process_screening(file: UploadFile = File(...)):
    try:
        return await screening_controller.process_screening(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

