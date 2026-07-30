import os
from pathlib import Path

def resolve_model_path() -> Path:
    """
    Resolves the location of best_model.pth checking env variables,
    project root relative paths, working directory, and package directories.
    """
    env_path = os.getenv("MODEL_PATH")
    if env_path:
        p = Path(env_path)
        if p.exists():
            return p.resolve()

    base_dir = Path(__file__).resolve().parent.parent.parent.parent
    candidates = [
        base_dir / "notebook" / "best_model.pth",
        Path("notebook/best_model.pth"),
        Path("../notebook/best_model.pth"),
        Path("../../notebook/best_model.pth"),
        base_dir / "app" / "models" / "best_model.pth",
        Path("app/models/best_model.pth"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()

    return base_dir / "notebook" / "best_model.pth"


class Settings:
    PROJECT_NAME: str = "ClearSight MultiNet-ANFIS Glaucoma Tele-Ophthalmology API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Shared secret for internal gateway authentication
    INTERNAL_SECRET: str = os.getenv(
        "FASTAPI_INTERNAL_SECRET",
        os.getenv("INTERNAL_SECRET", "clearsight_internal_secret_key_2026")
    )

    # Allowed CORS origins restricted to Spring Boot Gateway / internal service
    ALLOWED_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:8081,http://spring-api:8080").split(",")
        if origin.strip()
    ]

    # Path to saved model weights
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent.parent
    MODEL_PATH: Path = resolve_model_path()
    DATASETS_DIR: Path = BASE_DIR / "notebook" / "datasets"

    NUM_RULES: int = 8
    ANFIS_DIM: int = 16


settings = Settings()

