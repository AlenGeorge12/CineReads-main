# backend/Dockerfile - CORRECTED VERSION

# --- Stage 1: Define the base environment ---
FROM python:3.11-slim

# --- Stage 2: Set up the application directory ---
WORKDIR /app

# --- Stage 3: Install dependencies ---
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Stage 4: Copy application code ---
COPY . .

# --- Stage 5: Define runtime configuration ---
EXPOSE 8000

# 🐛 FIX: Change the CMD to use 'python -m uvicorn' instead of just 'uvicorn'.
# This ensures the uvicorn command is found and executed correctly via the Python interpreter.
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]