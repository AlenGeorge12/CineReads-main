# CineReads Project Summary

This document provides a summary of the CineReads project, including its purpose, technology stack, architecture, and operational procedures.

## Project Overview

CineReads is an application that recommends fiction books inspired by movies. It leverages a Large Language Model (LLM) for theme-level analysis and the Hardcover API for real book data to generate insightful and human-like recommendations. Key features include movie-to-book recommendations, smart re-ranking based on user preferences, and a caching mechanism for performance.

## Technology Stack

- **Frontend**:
  - Next.js (App Router)
  - React
  - TypeScript
  - Tailwind CSS

- **Backend**:
  - Python 3.11
  - FastAPI

- **AI & Data**:
  - OpenAI (GPT-4.1-mini) for thematic analysis.
  - Hardcover API (GraphQL) for book metadata.

- **Database**:
  - The application does not use a traditional database. It employs a file-based caching system for storing book and recommendation data.

## Architecture

The project follows a monolithic architecture, consisting of two primary components:
- A **frontend** application responsible for the user interface and user interactions.
- A **backend** API that handles the core logic, including communication with the OpenAI and Hardcover APIs.

## Current State

### Build

- **Frontend**: To build the frontend application, run the following command in the `frontend` directory:
  ```bash
  npm run build
  ```

- **Backend**: The backend does not have a separate build step. Dependencies are managed with `pip`.

### Test

- **Frontend**: Unit and component tests for the frontend are run using Jest. Execute the tests with:
  ```bash
  npm test
  ```

- **Backend**: Backend tests are run using `pytest`.

### Run Locally

- **Frontend**: To start the development server for the frontend, navigate to the `frontend` directory and run:
  ```bash
  npm run dev
  ```
  The application will be available at `http://localhost:3000`.

- **Backend**: To run the backend API, navigate to the `backend` directory and execute:
  ```bash
  uvicorn app.main:app --reload --port 8000
  ```
  The API will be accessible at `http://localhost:8000`.

## Deployment Goal

- **Frontend**: The frontend is designed to be deployed on **Vercel**.
- **Backend**: The backend is intended for deployment on **Render**.
