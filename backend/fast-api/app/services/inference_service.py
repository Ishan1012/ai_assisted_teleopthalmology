import torch
from app.core.model_loader import get_model, device
from app.services.preprocessing_service import preprocessing_service
from app.services.anfis_service import anfis_service

class InferenceService:
    def run_screening(self, image_bytes: bytes, filename: str):
        # 1. Run Preprocessing Pipeline
        tensor, stages, orig_size, crop_bounds, max_loc = preprocessing_service.process_image(image_bytes)
        
        # 2. PyTorch Model Forward Pass
        tensor = tensor.to(device)
        model = get_model()
        
        with torch.no_grad():
            model_outputs = model(tensor)

        # 3. Format ANFIS & Diagnostic Output
        anfis_res = anfis_service.format_anfis_outputs(model_outputs)

        pipeline_result = {
            "stages": stages,
            "original_size": orig_size,
            "crop_bounds": crop_bounds,
            "max_loc": max_loc
        }

        return {
            "filename": filename,
            **anfis_res,
            "pipeline": pipeline_result
        }

inference_service = InferenceService()
