# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM python:3.12-slim

# Install system dependencies and uv
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir uv==0.8.13

WORKDIR /code

# Copy configurations and lockfile
COPY ./pyproject.toml ./README.md ./uv.lock* ./

# Copy backend codebase
COPY ./backend ./backend

# Sync dependencies using uv
RUN uv sync --frozen

EXPOSE 8080

# Run FastAPI app
CMD ["uv", "run", "uvicorn", "backend.main:fastapi_app", "--host", "0.0.0.0", "--port", "8080"]