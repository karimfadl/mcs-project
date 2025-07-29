# TechNova Store – Artefacts

This folder contains the artefacts for the **TechNova Store** Individual Project submission for City, University of London (MSc Computer Science).

It includes:

- Frontend source code
- Backend source code
- Database schema and seed files
- Media assets (product images and attribution)
- Instructions for running and testing

---

## Folder Structure

```
artefacts/
├── frontend/
├── backend/
├── database/
└── media/
```

---

## How to Run and Test Frontend

### Prerequisites
- Web browser (Chrome, Firefox, Edge, Safari)
- Python 3 installed (for local server) **OR** VS Code with Live Server extension

### Steps

**Option A (Python)**
```
cd artefacts/code/frontend
python3 -m http.server 5500
```
Then open in browser:
```
http://localhost:5500
```

**Option B (VS Code Live Server)**
- Open `artefacts/code/frontend` in VS Code
- Right-click `index.html` → "Open with Live Server"

**What to Check**
- Page loads with header, navigation, footer
- Product cards load dynamically from backend API
- Images display correctly
- Responsive design works on resize

---

## How to Run and Test Backend

### Prerequisites
- Node.js and npm installed
- MySQL (optional for integration)

### Steps

```
cd artefacts/backend
npm install
node server.js
```

Server runs at:
```
http://localhost:3000
```

**Test API Routes**

**GET /products**
```
http://localhost:3000/products
```
Returns JSON list of products.

**POST /register** (use Postman or curl)
```
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```
Returns confirmation message.

---

## How to Run and Test Integration

- Ensure backend server is running on port 3000
- Start frontend server on port 5500
- Open frontend in browser
- Products are loaded dynamically from API
- Stop backend → frontend shows error message (proves integration)

---

## How to Test Database

**Minimum (No Install Required)**
- Includes `schema.sql` and `seed_data.sql` for review
- `ERD_diagram.png` shows design

**Optional Integration**
- Install MySQL
- Create `technova_db`
- Load schema and seed:
```
SOURCE schema.sql;
SOURCE seed_data.sql;
```
- Update backend Sequelize config with DB credentials
- Restart server
- Confirm `/products` route fetches real DB data

---

## Media

- `artefacts/media/images/` contains product images for the frontend
- `artefacts/media/attribution.txt` includes credits for sourced images and icons

---

## Author

Karim Mahmoud Abouelfadl 
City, University of London – MSc Computer Science
