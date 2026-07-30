import asyncio
import io
import os
import sys
from PIL import Image
from fastapi import HTTPException, UploadFile

# Ensure app module is in Python path when executed directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.config import settings
from app.core.security import verify_internal_secret
from app.controllers.screening_controller import screening_controller
from app.models.schemas import ScreeningResponse

def create_dummy_image_bytes():
    image = Image.new("RGB", (100, 100), color="red")
    buf = io.BytesIO()
    image.save(buf, format="JPEG")
    return buf.getvalue()

def test_config_settings():
    print("Testing config settings...")
    assert settings.INTERNAL_SECRET == "clearsight_internal_secret_key_2026" or len(settings.INTERNAL_SECRET) > 0
    assert "http://localhost:8081" in settings.ALLOWED_ORIGINS
    assert "http://spring-api:8081" in settings.ALLOWED_ORIGINS
    assert settings.MODEL_PATH.exists(), f"Model path {settings.MODEL_PATH} should exist"
    print("  -> config settings test PASSED")

def test_cors_middleware():
    print("Testing CORS middleware configuration...")
    cors_middlewares = [m for m in app.user_middleware if m.cls.__name__ == "CORSMiddleware"]
    assert len(cors_middlewares) > 0
    cors = cors_middlewares[0]
    assert "http://localhost:8081" in cors.kwargs["allow_origins"]
    assert "http://spring-api:8081" in cors.kwargs["allow_origins"]
    print("  -> CORS middleware test PASSED")

async def test_security_validation():
    print("Testing X-Internal-Secret security dependency...")
    # 1. Missing header
    try:
        await verify_internal_secret(None)
        assert False, "Should have raised 401 for missing header"
    except HTTPException as exc:
        assert exc.status_code == 401
        assert "Unauthorized" in exc.detail or "X-Internal-Secret" in exc.detail

    # 2. Invalid secret
    try:
        await verify_internal_secret("invalid_secret_key_123")
        assert False, "Should have raised 401 for invalid secret"
    except HTTPException as exc:
        assert exc.status_code == 401

    # 3. Valid secret
    res = await verify_internal_secret(settings.INTERNAL_SECRET)
    assert res == settings.INTERNAL_SECRET
    print("  -> security validation test PASSED")

def test_route_registration():
    print("Testing route registration...")
    openapi_paths = list(app.openapi()["paths"].keys())
    print("Registered OpenAPI paths:", openapi_paths)
    assert "/health" in openapi_paths, f"Missing /health in {openapi_paths}"
    assert "/api/v1/health" in openapi_paths, f"Missing /api/v1/health in {openapi_paths}"
    assert "/api/v1/screening/screen" in openapi_paths, f"Missing /api/v1/screening/screen in {openapi_paths}"
    assert "/api/v1/screening/predict" in openapi_paths, f"Missing /api/v1/screening/predict in {openapi_paths}"
    print("  -> route registration test PASSED")

def test_health_endpoints_direct():
    print("Testing health endpoints...")
    from app.main import health_check, api_v1_health_check
    res1 = health_check()
    assert res1 == {"status": "healthy"}
    res2 = api_v1_health_check()
    assert res2 == {"status": "healthy"}
    print("  -> health endpoints test PASSED")

async def test_screening_end_to_end():
    print("Testing screening inference processing & output schema...")
    img_bytes = create_dummy_image_bytes()
    upload_file = UploadFile(filename="test_fundus.jpg", file=io.BytesIO(img_bytes), headers={"content-type": "image/jpeg"})
    
    result = await screening_controller.process_screening(upload_file)
    
    # Validate against ScreeningResponse Pydantic schema
    validated_response = ScreeningResponse(**result)
    assert validated_response.prediction in ["Glaucoma", "Normal"]
    assert 0.0 <= validated_response.glaucoma_probability <= 1.0
    assert 0.0 <= validated_response.confidence_percentage <= 100.0
    assert len(validated_response.recommendation) > 0
    assert "CDR estimated" in validated_response.cup_to_disc_ratio_summary
    print("  -> screening inference test PASSED")

async def test_screening_value_error_handling():
    print("Testing ValueError handling in screening routes...")
    from app.routes.screening_routes import process_screening
    upload_file = UploadFile(filename="test.txt", file=io.BytesIO(b"not an image"), headers={"content-type": "text/plain"})
    try:
        await process_screening(upload_file)
        assert False, "Should have raised HTTPException 400 for non-image file"
    except HTTPException as exc:
        assert exc.status_code == 400
        assert "Uploaded file must be a valid image format" in exc.detail
    print("  -> ValueError handling test PASSED")

async def main():
    test_config_settings()
    test_cors_middleware()
    await test_security_validation()
    test_route_registration()
    test_health_endpoints_direct()
    await test_screening_end_to_end()
    await test_screening_value_error_handling()
    print("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
