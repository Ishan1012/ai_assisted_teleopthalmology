from fastapi import UploadFile, HTTPException
from app.services.inference_service import inference_service

class ScreeningController:
    async def process_screening(self, file: UploadFile):
        if not file.content_type or not file.content_type.startswith("image/"):
            raise ValueError("Uploaded file must be a valid image format (PNG, JPG, JPEG).")
        
        try:
            image_bytes = await file.read()
            result = inference_service.run_screening(image_bytes, file.filename)
            return result
        except ValueError:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

screening_controller = ScreeningController()
