import io
import logging
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader
from app.services.embedding_service import embedding_service
from app.services.mongo_service import mongo_service

logger = logging.getLogger(__name__)

class IngestionService:
    def extract_text(self, file_bytes: bytes, filename: str) -> str:
        lower_name = filename.lower()
        if lower_name.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(file_bytes))
            text_parts = []
            for page_num, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    text_parts.append(page_text.strip())
            return "\n\n".join(text_parts)
        else:
            # Fallback to UTF-8 text decode
            return file_bytes.decode("utf-8", errors="replace")

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 150) -> List[str]:
        if not text:
            return []
        
        # Clean text
        cleaned_text = " ".join(text.split())
        if len(cleaned_text) <= chunk_size:
            return [cleaned_text]

        chunks = []
        start = 0
        while start < len(cleaned_text):
            end = start + chunk_size
            # If not at the end of the text, try finding a natural sentence/word boundary
            if end < len(cleaned_text):
                boundary = cleaned_text.rfind(". ", start, end)
                if boundary != -1 and boundary > start + (chunk_size // 2):
                    end = boundary + 1
                else:
                    space_boundary = cleaned_text.rfind(" ", start, end)
                    if space_boundary != -1 and space_boundary > start + (chunk_size // 2):
                        end = space_boundary

            chunk = cleaned_text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap if end < len(cleaned_text) else len(cleaned_text)
            
        return chunks

    def ingest_document(self, file_bytes: bytes, filename: str, title: str = "") -> Tuple[int, str]:
        extracted_text = self.extract_text(file_bytes, filename)
        if not extracted_text.strip():
            raise ValueError(f"No extractable text found in file {filename}")

        doc_title = title.strip() or filename.replace("_", " ").replace("-", " ")

        chunks = self.chunk_text(extracted_text)
        if not chunks:
            raise ValueError(f"Unable to produce chunks from file {filename}")

        records: List[Dict[str, Any]] = []
        for idx, chunk in enumerate(chunks):
            embedding = embedding_service.embed_text(chunk)
            records.append({
                "title": doc_title,
                "source": filename,
                "chunk_index": idx + 1,
                "text": chunk,
                "embedding": embedding
            })

        inserted_count = mongo_service.insert_chunks(records)
        return inserted_count, f"Successfully ingested {inserted_count} chunks from {filename}"

ingestion_service = IngestionService()
