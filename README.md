# Meow-mory

[icon](frontend/public/meowmory.png)
Meow-mory is a full-stack prototype for vocabulary learning assisted by large language models.  
The system combines a FastAPI backend, a modern frontend, and a model-driven memory strategy to support word import, review scheduling, and learning progress analysis.

This project is designed as a research-oriented and extensible system rather than a single-purpose application.

## Overview

Learning vocabulary efficiently requires repeated exposure, adaptive review intervals, and meaningful context.  
Meow-mory explores how large language models can be integrated into a vocabulary learning workflow to support memory reinforcement and personalized review suggestions.

The system focuses on three core ideas:

• structured word management  
• model-assisted memory and review strategies  
• clear separation between frontend, backend, and model logic  

## Key Features

• Import and manage vocabulary in batches  
• Track learning history and review progress  
• Generate review schedules using model-based strategies  
• Visualize learning statistics and trends  
• Modular backend design that allows replacing or extending model logic  
• Frontend-backend separation for flexible development and deployment  

## System Architecture

The system follows a classic frontend–backend architecture with an explicit model layer.

Frontend  
A web-based user interface responsible for word input, review interaction, and visualization.

Backend  
A FastAPI service that handles API requests, business logic, data persistence, and communication with the model layer.

Model Layer  
An abstraction over large language models or memory strategies, used to estimate memory strength and recommend review timing.

Database  
A relational database storing users, vocabulary items, learning records, and review logs.

The detailed architecture and data flow are described in `docs/system_design.md`.

## Project Structure

```text
Meow-mory/
├── backend/
│   ├── api/            # API routes and request validation
│   ├── services/       # Business logic and model adapters
│   ├── db/             # Database models and migrations
│   └── main.py         # FastAPI application entry point
├── frontend/
│   ├── src/            # UI components and pages
│   └── vite.config.ts
├── docs/
│   ├── system_design.md
│   └── assets/
└── README.md
```

## Technology Stack

Meow-mory is implemented as a full stack system with a clear separation between user interface, backend services, model logic, and data storage.  
The technology stack is chosen to balance development efficiency, extensibility, and research flexibility.
[stack](docs/High-LevelSystemArchitecture)
### Backend

• Language: Python  
• Framework: FastAPI  

The backend is built with FastAPI to provide a high performance and asynchronous API layer.  
FastAPI offers automatic request validation, clear type definitions, and built in OpenAPI documentation, which makes it suitable for rapid prototyping as well as structured system design.

Key backend responsibilities include:

• REST API endpoints for vocabulary management and review workflows  
• business logic and memory strategy coordination  
• unified adapter interface for model integration  
• database access and persistence  

### Frontend

• Language: TypeScript  
• Framework: React  
• Build tool: Vite  

The frontend is implemented as a single page application using React.  
Vite is used to provide fast development startup and efficient builds.

The frontend focuses on:

• vocabulary input and batch import  
• interactive review sessions  
• visualization of learning progress and statistics  
• clean separation from backend logic via HTTP APIs  

### Model Layer

• Large language model integration through an abstract adapter layer  

The model layer is intentionally decoupled from both frontend and backend API logic.  
This allows different memory strategies or large language models to be plugged in without changing the rest of the system.

Typical responsibilities of the model layer include:

• estimating memory strength or decay  
• suggesting review intervals  
• generating semantic explanations or associations  

### Database

• Relational database, recommended PostgreSQL  

A relational database is used to store structured learning data, including:

• users  
• vocabulary entries  
• learning history  
• review logs and timestamps  

This design supports both experimental analysis and long term learning tracking.

### Development and Deployment

• Python virtual environments for backend dependency isolation  
• Node.js based tooling for frontend development  
• Optional container based deployment using Docker  

The system is designed to run locally for development and can be deployed using containerization for production or demonstration purposes.

#### Deployment Notes

For production deployment, containerization is recommended.

+ Common setup includes:

• Docker and docker-compose
• a reverse proxy such as Nginx
• separate deployment for model services if needed

## Future Work

Planned or possible extensions:

• adaptive review algorithms based on long-term performance
• richer visualization of memory curves
• support for multiple languages and word sources
• user-specific model fine-tuning or personalization

## License

This project is released under the MIT License.
