# Person Management System

A full-stack web application built with React, Node.js (Express), PostgreSQL, and Docker Compose.

This project is part of the **SENG 384 course repository** and is located inside the `person-management-system` directory.

---

# Project Description

This project is a simple **Person Management System** developed as a full-stack web application assignment.

The system allows users to:

- Add a new person
- View all registered people
- Update existing person information
- Delete a person from the database

The project demonstrates the integration of:

- Frontend: React-based user interface
- Backend: RESTful API built with Node.js and Express
- Database: PostgreSQL
- Containerization: Docker and Docker Compose

---

# Technologies Used

- React
- Node.js
- Express
- PostgreSQL
- Docker
- Docker Compose

---

# Project Structure

seng-384/
└── person-management-system/
    ├── docker-compose.yml
    ├── .env.example
    ├── README.md
    ├── backend/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── db.js
    │       ├── index.js
    │       └── routes/
    │           └── people.js
    ├── frontend/
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── server.js
    │   └── public/
    │       └── index.html
    └── db/
        └── init.sql

# Features

Create a new person

Read all people

Read a single person by ID

Update person information

Delete a person

Client-side validation

Backend validation

Unique email constraint

Multi-container setup using Docker Compose

# Database Schema

The application uses a PostgreSQL database with a people table.

Table: people
Column	Type	Constraints
id	SERIAL	PRIMARY KEY
full_name	VARCHAR(255)	NOT NULL
email	VARCHAR(255)	NOT NULL, UNIQUE

# Setup and Run Instructions
Prerequisites

Make sure the following software is installed:

Docker Desktop

# Run the Project

Clone the repository:

git clone https://github.com/kaan200364/seng-384.git

Navigate into the project directory:

cd seng-384/person-management-system

Run the system using Docker Compose:

docker compose up --build

# Access the Application 

After running the containers, open the following URLs:

Frontend
http://localhost:3000
Backend
http://localhost:5000
API Base URL
http://localhost:5000/api

# Environment Variables

The backend uses the following environment variables:

DB_HOST

DB_PORT

DB_USER

DB_PASSWORD

DB_NAME

Example .env file:
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=people_db

# API Documentation
GET /api/people

Returns all people in the system.

Example Response
[
  {
    "id": 1,
    "full_name": "Ahmet Yılmaz",
    "email": "ahmet@mail.com"
  }
]
GET /api/people/:id

Returns a single person by ID.

Example Response
{
  "id": 1,
  "full_name": "Ahmet Yılmaz",
  "email": "ahmet@mail.com"
}
Error Response
{
  "error": "PERSON_NOT_FOUND"
}
POST /api/people

Creates a new person.

Request Body
{
  "full_name": "Ahmet Yılmaz",
  "email": "ahmet@mail.com"
}
Possible Errors
{
  "error": "MISSING_FIELDS"
}
{
  "error": "INVALID_EMAIL_FORMAT"
}
{
  "error": "EMAIL_ALREADY_EXISTS"
}
PUT /api/people/:id

Updates an existing person.

Request Body
{
  "full_name": "Updated Name",
  "email": "updated@mail.com"
}
DELETE /api/people/:id

Deletes a person by ID.

Success Response
{
  "message": "PERSON_DELETED"
}

# Validation Rules
Frontend Validation

Full Name cannot be empty

Email cannot be empty

Email must follow a valid format

Backend Validation

Full Name is required

Email is required

Email format must be valid

Email must be unique

# HTTP Status Codes
Code	Meaning
200	Success
201	Created
400	Validation Error
404	Not Found
409	Email Conflict
500	Server Error


# Screenshots

The following screenshots should be included for demonstration:

Registration form page
<img width="1887" height="881" alt="registirationformpage" src="https://github.com/user-attachments/assets/b3a5334d-f5eb-4106-b7fe-d101017d9cd5" />


People list page

Successful create operation

Successful update operation

Delete confirmation dialog

Docker containers running (docker ps)

# Learning Outcomes

This project demonstrates:

Frontend and backend integration

RESTful API development

PostgreSQL database design

Docker containerization

Multi-service application deployment with Docker Compose
