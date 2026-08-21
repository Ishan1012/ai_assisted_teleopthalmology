import logging
import hashlib
from typing import List
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self._configured = False

    def _ensure_configured(self):
        if not self._configured and settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._configured = True

    def embed_text(self, text: str, task_type: str = "retrieval_document") -> List[float]:
        self._ensure_configured()
        if not settings.GEMINI_API_KEY:
            logger.info("GEMINI_API_KEY not configured, using fallback embedding vector.")
            return self._fallback_embedding(text)

        try:
            # google-generativeai embed_content API
            response = genai.embed_content(
                model=settings.EMBEDDING_MODEL,
                content=text,
                task_type=task_type
            )
            embedding = response.get("embedding")
            if embedding:
                return embedding
            raise ValueError("Empty embedding returned from Gemini API")
        except Exception as e:
            logger.warning("Gemini embedding API call failed (%s). Falling back to synthetic embedding vector.", e)
            return self._fallback_embedding(text)

    def embed_query(self, query: str) -> List[float]:
        return self.embed_text(query, task_type="retrieval_query")

    def _fallback_embedding(self, text: str) -> List[float]:
        """
        Deterministic pseudo-embedding generated via sha256 hashing for local offline resilience.
        """
        dim = settings.EMBEDDING_DIM
        hash_digest = hashlib.sha256(text.encode("utf-8")).digest()
        # Expand 32 bytes into 768 float values in range [-1.0, 1.0]
        values = []
        for i in range(dim):
            byte_val = hash_digest[(i * 7) % len(hash_digest)]
            val = (byte_val / 127.5) - 1.0
            values.append(round(val, 6))
        return values

embedding_service = EmbeddingService()
