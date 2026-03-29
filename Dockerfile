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

# Use python to run main.py natively catching the PORT env
CMD ["python", "main.py"]
