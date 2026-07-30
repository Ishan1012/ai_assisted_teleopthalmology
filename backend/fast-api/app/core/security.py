import secrets
from fastapi import Header, HTTPException, status
from app.core.config import settings

async def verify_internal_secret(x_internal_secret: str = Header(None, alias="X-Internal-Secret")):
    """
    Validates that incoming requests from internal services (Spring Boot API Gateway)
    include the expected X-Internal-Secret header.
    Raises 401 Unauthorized if the header is missing or invalid.
    """
    if not x_internal_secret or not secrets.compare_digest(x_internal_secret, settings.INTERNAL_SECRET):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid or missing X-Internal-Secret header."
        )
    return x_internal_secret
