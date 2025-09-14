# Library Management API for HackTheAI

A comprehensive Library Management API built with Express.js for the HackTheAI preliminaries.

## Team Information

**Team Name:** BRACU RuntimeError

**Team Members:**
- Ishrak Hamim Mahi (ishrak.hamim.mahi@g.bracu.ac.bd)
- Md. Habibun Nabi Hemel (habibun.nabi.hemel@g.bracu.ac.bd)

## Features

- Complete member management system
- Book catalog with borrowing and returning functionality
- Advanced search capabilities with complex filtering
- Reservation system with priority queue
- Docker and docker-compose setup for easy deployment

## Requirements

- Node.js 14+
- npm or yarn
- Docker and docker-compose (for containerized deployment)

## Local Development

### Option 1: Running Locally

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:8000.

### Option 2: Running with Docker

1. Build and start the Docker container:
```bash
docker-compose up -d --build
```

The server will be accessible at http://localhost:8000.

## API Endpoints

### Members API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/members | Create a new member |
| GET    | /api/members | Get all members |
| GET    | /api/members/:member_id | Get a specific member by ID |
| PUT    | /api/members/:member_id | Update an existing member |
| DELETE | /api/members/:member_id | Delete a member |
| GET    | /api/members/:member_id/history | Get borrowing history for a member |

### Books API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/books | Add a new book |
| GET    | /api/books/:book_id | Get a specific book by ID |
| DELETE | /api/books/:book_id | Delete a book |
| GET    | /api/books/search | Advanced book search with filters |

### Borrowing API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/borrow | Borrow a book |
| POST   | /api/return | Return a book |
| GET    | /api/borrowed | Get all currently borrowed books |
| GET    | /api/overdue | Get all overdue books |

### Reservation API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /api/reservations | Create a new book reservation |

## Example Requests

### Create a Member

```bash
curl -X POST http://localhost:8000/api/members \
  -H "Content-Type: application/json" \
  -d '{"member_id": 1, "name": "Alice Johnson", "age": 22}'
```

### Add a Book

```bash
curl -X POST http://localhost:8000/api/books \
  -H "Content-Type: application/json" \
  -d '{"book_id": 1, "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "categories": ["fiction", "classic"], "published_date": "1925-04-10", "rating": 4.5}'
```

### Borrow a Book

```bash
curl -X POST http://localhost:8000/api/borrow \
  -H "Content-Type: application/json" \
  -d '{"member_id": 1, "book_id": 1, "borrow_date": "2023-09-15", "return_date": "2023-09-29"}'
```

### Return a Book

```bash
curl -X POST http://localhost:8000/api/return \
  -H "Content-Type: application/json" \
  -d '{"member_id": 1, "book_id": 1, "return_date": "2023-09-25"}'
```

### Advanced Book Search

```bash
curl -X GET "http://localhost:8000/api/books/search?q=gatsby&category=fiction&min_rating=4&sort_by=rating&sort_order=desc&page=1&limit=10&include_analytics=true"
```

## Project Structure

```
.
├── app.js              # Main application file with all endpoints
├── package.json        # Dependencies and scripts
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose configuration
├── TEAM_INFO.md        # Team information
└── README.md           # Project documentation
```

## Submission

To create your submission zip file, you can use the provided script:

```bash
chmod +x submit.sh
./submit.sh
```

This will create a zip file named "BRACU_RuntimeError.zip" in the parent directory.
