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

```text
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
