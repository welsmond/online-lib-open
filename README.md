# 📚 Online Library - Audiobooks Platform

Full-stack audiobook library with React frontend and Node.js backend.

## 🚀 Quick Start

```bash
docker-compose up -d
Frontend: http://localhost:3000

Backend API: http://localhost:5000/api

Database: localhost:5432

Features
✅ JWT Authentication
✅ Audiobook Catalog
✅ Search & Filter
✅ User Library
✅ Audio Player
✅ Rating & Reviews

Tech Stack
Backend: Node.js, Express, PostgreSQL

Frontend: React, TypeScript, Material-UI

DevOps: Docker, GitHub Actions

API Endpoints
text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/books
GET    /api/books/:id
GET    /api/library/my
POST   /api/library/add/:id
DELETE /api/library/:id
License
MIT