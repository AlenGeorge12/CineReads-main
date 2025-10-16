# frontend/Dockerfile

# --- STAGE 1: The "Builder" Stage ---
# We'll name this stage 'builder'. We start with a Node.js base image to get access to npm.
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the package files and install dependencies.
# Just like the backend, we copy these first to take advantage of Docker's caching.
COPY package*.json ./
RUN npm install

# Now copy the rest of the frontend source code
COPY . .

# Run the build command defined in your package.json.
# This creates an optimized, production-ready version of your Next.js app.
RUN npm run build

# --- STAGE 2: The "Final" Stage ---
# Now, we start fresh with a new, clean base image.
# This image is all we need to SERVE the files we just built.
FROM node:18-alpine

WORKDIR /app

# Copy the special 'standalone' output from the 'builder' stage.
# This folder contains only the necessary files to run the Next.js server,
# making our final image very small.
COPY --from=builder /app/.next/standalone ./

# Also copy the static assets (CSS, images, etc.)
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Tell Docker that the container will listen on port 3000 at runtime.
EXPOSE 3000

# This is the command that starts the Next.js production server.
CMD ["node", "server.js"]