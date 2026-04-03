# Use a high-performance, official Python runtime
FROM python:3.11-slim-bullseye

# Environment config: Optimize for Cloud deployments
ENV PORT=8181
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Working directory
WORKDIR /app

# Install dependencies before code to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose target port
EXPOSE 8181

# Command to run uvicorn
# We run main.py which starts uvicorn on the correct $PORT
CMD ["python", "main.py"]
