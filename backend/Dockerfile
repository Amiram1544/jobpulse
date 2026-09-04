FROM python:3.12-slim-bookworm

# Install uv from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv


WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT="/app/.venv" \
    PATH="/app/.venv/bin:$PATH"


# Install dependencies first for better Docker caching
COPY pyproject.toml ./
RUN uv sync --no-dev

COPY . .

# Sync again after code is available
RUN uv sync --no-dev


EXPOSE 8080

CMD ["uvicorn", "config.asgi:application", "--host", "0.0.0.0", "--port", "8000"]