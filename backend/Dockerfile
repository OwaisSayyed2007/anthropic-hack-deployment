FROM python:3.11-slim

WORKDIR /app

# Install system-level build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    curl \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && rm -rf /var/lib/apt/lists/*

# Add Rust to PATH
ENV PATH="/root/.cargo/bin:${PATH}"

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies (ignoring local venv if it somehow got copied)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Railway uses the PORT environment variable
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
