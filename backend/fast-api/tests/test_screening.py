import io
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.core.config import settings

client = TestClient(app)

def create_dummy_image_bytes():
    image = Image.new("RGB", (100, 100), color="red")
    buf = io.BytesIO()
    image.save(buf, format="JPEG")
    return buf.getvalue()

def test_config_settings():
    assert settings.INTERNAL_SECRET is not None
    assert len(settings.INTERNAL_SECRET) > 0
    assert "http://localhost:8081" in settings.ALLOWED_ORIGINS
    assert "http://spring-api:8081" in settings.ALLOWED_ORIGINS
    assert settings.MODEL_PATH is not None

def test_screening_missing_secret_header():
    img_bytes = create_dummy_image_bytes()
    response = client.post(
        "/api/v1/screening/screen",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 401
    assert "X-Internal-Secret" in response.json()["detail"]

def test_screening_invalid_secret_header():
    img_bytes = create_dummy_image_bytes()
    response = client.post(
        "/api/v1/screening/screen",
        headers={"X-Internal-Secret": "invalid_secret_key"},
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 401

def test_screening_valid_secret_header_screen():
    img_bytes = create_dummy_image_bytes()
    response = client.post(
        "/api/v1/screening/screen",
        headers={"X-Internal-Secret": settings.INTERNAL_SECRET},
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "confidence_percentage" in data
    assert "glaucoma_probability" in data
    assert "recommendation" in data
    assert "cup_to_disc_ratio_summary" in data

def test_screening_valid_secret_header_predict_alias():
    img_bytes = create_dummy_image_bytes()
    response = client.post(
        "/api/v1/screening/predict",
        headers={"X-Internal-Secret": settings.INTERNAL_SECRET},
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "confidence_percentage" in data
    assert "glaucoma_probability" in data
    assert "recommendation" in data
    assert "cup_to_disc_ratio_summary" in data

def test_health_endpoints():
    response_root_health = client.get("/health")
    assert response_root_health.status_code == 200
    assert response_root_health.json() == {"status": "healthy"}

    response_v1_health = client.get("/api/v1/health")
    assert response_v1_health.status_code == 200
    assert response_v1_health.json() == {"status": "healthy"}

if __name__ == "__main__":
    print("Running test_config_settings...")
    test_config_settings()
    print("Running test_health_endpoints...")
    test_health_endpoints()
    print("Running test_screening_missing_secret_header...")
    test_screening_missing_secret_header()
    print("Running test_screening_invalid_secret_header...")
    test_screening_invalid_secret_header()
    print("Running test_screening_valid_secret_header_screen...")
    test_screening_valid_secret_header_screen()
    print("Running test_screening_valid_secret_header_predict_alias...")
    test_screening_valid_secret_header_predict_alias()
    print("ALL TESTS PASSED SUCCESSFULLY!")

