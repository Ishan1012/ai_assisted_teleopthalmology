cd ../backend/fast-api
uv sync
uv run python -m uvicorn app.main:app --host 127.0.0.1 --port 8000