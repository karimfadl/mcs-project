# TechNova Store – Docker Deployment Guide

This README explains how to build, run, and test the complete TechNova Store system using Docker Compose.

It describes:

- Project structure
- Prerequisites
- How to build and run the stack
- How to reset the database
- How to test frontend and backend integration

---

## 📌 Project Structure

```
artefacts/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── server.js
│   ├── package.json
│   └── wait-for.sh
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── product1.jpg
│   └── product2.jpg
└── database/
    ├── schema.sql
    └── seed_data.sql
```

---

## Prerequisites

- Docker installed
- Docker Compose installed

---

## How to Build and Run

From the `artefacts/` directory:

```bash
docker-compose up --build
```

This command will:

- Build images for **backend** and **frontend**
- Start **MySQL** with the database schema and seed data
- Run **Node.js API** server connected to MySQL
- Serve the **frontend** via Nginx

---

## Accessing the App

- Frontend: [http://localhost:5500](http://localhost:5500)
- Backend API: [http://localhost:3000/products](http://localhost:3000/products)
- Database: MySQL on port 3306

---

## Testing the Frontend

Open a browser:

```
http://localhost:5500
```

✅ You should see:

- Header with navigation
- Dynamically loaded products
- Images, names, prices loaded from the API

---

## Testing the Backend

1️⃣ Open in browser:

```
http://localhost:3000/products
```

You should see JSON:

```json
[
  {
    "product_id": 1,
    "name": "Product 1",
    "price": 99.99,
    "image_url": "product1.jpg",
    ...
  },
  ...
]
```

Proves backend is reading from MySQL database.

---

## Resetting the Database

If you want to *wipe* the existing MySQL data and re-run the schema/seed:

```bash
docker-compose down -v
docker-compose up --build
```

This will:

- Delete the MySQL volume
- Re-run **schema.sql** and **seed_data.sql** at startup
- Ensure a clean, fresh database

---

## Environment Details

- MySQL:
  - Database: technova_db
  - User: root
  - Password: root
- Ports:
  - Frontend: 5500
  - Backend: 3000
  - MySQL: 3306

---

## Notes

- The **backend** service uses `wait-for.sh` to ensure MySQL is ready before connecting.
- The **frontend** service copies static HTML, CSS, JS, and images into Nginx.
- The **backend** uses Sequelize to connect to MySQL with environment variables set in `docker-compose.yml`.

---

## Example Commands

Start:

```
docker-compose up --build
```

Stop:

```
docker-compose down
```

Reset:

```
docker-compose down -v
docker-compose up --build
```

---

## Author

Karim Mahmoud Abouelfadl
City, University of London – MSc Computer Science
