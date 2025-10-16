# backend/Dockerfile

# --- Stage 1: Define the base environment ---
# Every Docker image starts FROM a base image. We'll use an official Python 3.11 image.
# The 'slim' version is smaller, making our final image more lightweight.
FROM python:3.11-slim

# --- Stage 2: Set up the application directory ---
# This creates a directory named '/app' inside the container and sets it as our main working folder.
# All subsequent commands will run from here.
WORKDIR /app

# --- Stage 3: Install dependencies ---
# First, copy ONLY the requirements.txt file into the container.
COPY requirements.txt .

# Now, run the pip install command. Docker is smart: it saves this result.
# If you don't change your requirements.txt file, Docker will use a saved cache for this step,
# making future builds much faster. This is an important optimization.
RUN pip install --no-cache-dir -r requirements.txt

# --- Stage 4: Copy application code ---
# With dependencies installed, now we copy the rest of your backend application code
# (your .py files, etc.) into the /app directory inside the container.
COPY . .

# --- Stage 5: Define runtime configuration ---
# Tell Docker that the container will listen on port 8000 when it's running.
# This doesn't open the port to your machine, it just documents which port the app uses.
EXPOSE 8000

# This is the final command that will be executed when a container starts from this image.
# We run your FastAPI app using uvicorn. The '--host 0.0.0.0' is crucial; it tells the server
# to listen for connections from any IP address, allowing us to connect from our host machine.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]