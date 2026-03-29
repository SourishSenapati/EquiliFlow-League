FROM python:3.9-slim

# Expose port and disable python output buffering
ENV PORT=8181
ENV PYTHONUNBUFFERED=True

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files
COPY . ./

# Use uvicorn to run from main.py via the CMD
CMD exec uvicorn main:app --host 0.0.0.0 --port $PORT
