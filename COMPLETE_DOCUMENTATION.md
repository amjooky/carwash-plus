# CarWash+ Complete Documentation

> **Last Updated:** November 21, 2025  
> **Version:** 1.0.0  
> **Full Stack Car Wash Management System**

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation & Setup](#installation--setup)
4. [Database Setup (Prisma)](#database-setup-prisma)
5. [Architecture](#architecture)
6. [Features](#features)
7. [API Reference](#api-reference)
8. [Frontend Guide](#frontend-guide)
9. [Mobile App](#mobile-app)
10. [Security](#security)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## Overview

CarWash+ is a complete car wash management system with:
- **Backend API**: NestJS + PostgreSQL + Prisma + Redis
- **Web Dashboard**: Next.js 14 + TypeScript + Tailwind CSS
- **Mobile App**: React Native (Customer & Staff)
- **Authentication**: JWT (Access + Refresh tokens)
- **Authorization**: RBAC + Permission-based

### Tech Stack

**Backend:**
- Node.js 20+
- NestJS Framework
- PostgreSQL 16
- Prisma ORM
- Redis 7
- JWT Authentication
- Swagger API Documentation

**Frontend:**
- React 18
- Next.js 14
- TypeScript
- Tailwind CSS + ShadCN UI
- React Query (TanStack Query)
- Zustand State Management
- Leaflet Maps

**Mobile:**
- React Native
- TypeScript
- React Navigation
- Firebase (Push Notifications)

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- npm or yarn

### Start in 3 Steps

```powershell
# 1. Start Database
docker-compose up postgres -d

# 2. Backend Setup (Terminal 1)
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# 3. Frontend Setup (Terminal 2)
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api/docs
- Prisma Studio: http://localhost:5555

**Default Login:**
- Super Admin: `superadmin@carwash.com` / `Admin@123`
- Admin: `admin@carwash.com` / `Admin@123`

---

## Installation & Setup

### Option A: Docker (Recommended)

```powershell
# Clone repository
git clone <repository-url>
cd CarWash+

# Configure environment
Copy-Item .env.example .env
# Edit .env and set JWT secrets

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option B: Local Development

#### 1. PostgreSQL Setup

**Using Docker:**
```powershell
docker run -d --name carwash-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=carwash_db `
  -p 5432:5432 `
  postgres:16-alpine
```

**Or Local Installation:**
```sql
CREATE DATABASE carwash_db;
```

#### 2. Redis Setup

```powershell
docker run -d --name carwash-redis `
  -p 6379:6379 `
  redis:7-alpine
```

#### 3. Backend Setup

```powershell
cd backend

# Install dependencies
npm install

# Create .env file
Copy-Item .env.example .env

# Configure .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/carwash_db?schema=public"
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start development server
npm run start:dev
```

#### 4. Frontend Setup

```powershell
cd frontend

# Install dependencies
npm install

# Create .env.local file
New-Item .env.local

# Add to .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Start development server
npm run dev
```

---

## Database Setup (Prisma)

### Prisma Commands

#### Generate Prisma Client
```powershell
cd backend
npm run prisma:generate
# Or: npx prisma generate
```

#### Run Migrations
```powershell
npm run prisma:migrate
# Or: npx prisma migrate dev --name init
```

#### Seed Database
```powershell
npm run prisma:seed
# Or: npx ts-node prisma/seed.ts
```

#### Open Prisma Studio (Database GUI)
```powershell
npm run prisma:studio
# Or: npx prisma studio
# Access at: http://localhost:5555
```

#### Reset Database (⚠️ Deletes All Data)
```powershell
npx prisma migrate reset
```

#### Create New Migration
```powershell
npx prisma migrate dev --name <migration_name>
# Example: npx prisma migrate dev --name add_user_profile
```

#### Format Schema
```powershell
npx prisma format
```

#### Validate Schema
```powershell
npx prisma validate
```

#### Pull Database Schema
```powershell
npx prisma db pull
```

#### Push Schema (Development Only)
```powershell
npx prisma db push
```

### Database Schema Overview

**User Management:**
- Users, Sessions, Permissions, Roles
- JWT refresh token management
- Activity logging

**Car Wash Operations:**
- Centers (locations with coordinates)
- Services (with vehicle-type pricing)
- Bookings (multi-service support)
- Staff (shifts, assignments, ratings)

**Customer Management:**
- Customers (linked to users)
- Vehicles (make, model, license plate)
- Reviews & ratings

**Loyalty & Gamification:**
- Loyalty points (10% cashback)
- Customer badges
- Staff badges
- Leaderboards

**Payment System:**
- Payments
- Multiple payment methods
- Payment status tracking

**Notifications:**
- Customer notifications
- Staff notifications
- Booking reminders

**Analytics:**
- System analytics
- Logs (audit trail)
- Performance metrics

---

## Architecture

### Project Structure

```
CarWash+/
├── backend/                    # NestJS Backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Migration files
│   │   └── seed.ts            # Seed data
│   ├── src/
│   │   ├── common/
│   │   │   ├── decorators/    # Custom decorators
│   │   │   ├── guards/        # Auth & role guards
│   │   │   ├── strategies/    # Passport JWT
│   │   │   ├── prisma/        # Prisma service
│   │   │   ├── redis/         # Redis service
│   │   │   └── logger/        # Winston logger
│   │   ├── modules/
│   │   │   ├── auth/          # Authentication
│   │   │   ├── users/         # User management
│   │   │   ├── centers/       # Center management
│   │   │   ├── services/      # Service management
│   │   │   ├── bookings/      # Booking system
│   │   │   ├── customers/     # Customer management
│   │   │   ├── staff/         # Staff management
│   │   │   ├── payments/      # Payment processing
│   │   │   ├── notifications/ # Notification system
│   │   │   ├── dashboard/     # Dashboard analytics
│   │   │   └── public/        # Public endpoints
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   └── login/     # Login page
│   │   │   ├── superadmin/    # Super Admin dashboard
│   │   │   │   ├── centers/   # Center management
│   │   │   │   ├── users/     # User management
│   │   │   │   └── dashboard/ # Analytics
│   │   │   ├── owner/         # Owner dashboard
│   │   │   │   └── my-center/ # Edit own center
│   │   │   └── admin/         # Admin dashboard
│   │   ├── components/
│   │   │   ├── ui/            # ShadCN components
│   │   │   ├── charts/        # Chart components
│   │   │   ├── CenterFormModal.tsx  # Map picker modal
│   │   │   └── layouts/       # Layout components
│   │   ├── lib/
│   │   │   ├── api-client.ts  # Axios config
│   │   │   └── utils.ts
│   │   ├── services/          # API services
│   │   ├── store/             # Zustand stores
│   │   └── types/             # TypeScript types
│   ├── .env.local
│   ├── Dockerfile
│   └── package.json
│
├── mobile_app/                 # React Native Mobile
│   └── (Mobile app structure)
│
├── docker-compose.yml          # Docker orchestration
├── .env                        # Root environment
└── COMPLETE_DOCUMENTATION.md   # This file
```

### System Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Mobile    │      │   Web UI    │      │   Admin UI   │
│   (React    │      │  (Next.js)  │      │  (Next.js)   │
│   Native)   │      └─────────────┘      └──────────────┘
└─────────────┘             │                      │
       │                    └──────────┬───────────┘
       │                               │
       └───────────────┬───────────────┘
                       │ HTTP/REST
                       ↓
              ┌─────────────────┐
              │   Backend API   │
              │    (NestJS)     │
              └─────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ↓              ↓              ↓
┌─────────────┐  ┌──────────┐  ┌──────────┐
│  PostgreSQL │  │  Redis   │  │  Files   │
│  (Prisma)   │  │ (Cache)  │  │  (Logs)  │
└─────────────┘  └──────────┘  └──────────┘
```

---

## Features

### 🔐 Authentication & Security
- ✅ JWT Access + Refresh Tokens
- ✅ Password Hashing (bcrypt)
- ✅ Role-Based Access Control (RBAC)
- ✅ Permission-Based Authorization
- ✅ Rate Limiting
- ✅ CSRF Protection
- ✅ Security Headers (Helmet)
- ✅ CORS Configuration

### 👥 User Management
- ✅ Three Roles: SUPER_ADMIN, ADMIN (Owner), USER
- ✅ User CRUD operations
- ✅ Status management (ACTIVE, INACTIVE, SUSPENDED)
- ✅ Permission assignment
- ✅ Activity logging

### 🏢 Center Management
- ✅ Multi-center support
- ✅ Interactive map picker (Leaflet)
- ✅ Location coordinates (lat/lng)
- ✅ Operating hours
- ✅ Capacity management
- ✅ Amenities list
- ✅ Owner assignment

### 🧼 Service Management
- ✅ Multiple service types
- ✅ Dynamic pricing by vehicle type
- ✅ Service duration tracking
- ✅ Active/inactive status

### 📅 Booking System
- ✅ Multi-service bookings
- ✅ Date & time scheduling
- ✅ Status workflow (PENDING → CONFIRMED → IN_PROGRESS → COMPLETED)
- ✅ Staff assignment
- ✅ Automatic notifications
- ✅ Booking templates
- ✅ Recurring bookings
- ✅ Waitlist management

### 👨‍💼 Staff Management
- ✅ Staff roles (WASHER, SUPERVISOR, MANAGER)
- ✅ Shift scheduling
- ✅ Performance tracking
- ✅ Rating system
- ✅ Job completion stats
- ✅ Leaderboard

### 👤 Customer Management
- ✅ Customer profiles
- ✅ Vehicle management
- ✅ Booking history
- ✅ Loyalty points (10% cashback)
- ✅ Badge system
- ✅ Leaderboard
- ✅ Review system

### 💰 Payment System
- ✅ Multiple payment methods (CASH, CARD, MOBILE, ONLINE)
- ✅ Payment status tracking
- ✅ Transaction history

### 🎮 Gamification
- ✅ Loyalty points on booking completion
- ✅ Customer badges (BRONZE → DIAMOND)
- ✅ Staff badges
- ✅ Leaderboards (customers & staff)

### 🔔 Notifications
- ✅ Booking confirmations
- ✅ Booking reminders
- ✅ Payment confirmations
- ✅ Loyalty points earned
- ✅ Promotions
- ✅ System notifications

### 📊 Dashboard & Analytics
- ✅ Revenue overview
- ✅ Booking statistics
- ✅ Revenue trends
- ✅ Popular services
- ✅ Staff performance
- ✅ Recent activity

---

## API Reference

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "superadmin@carwash.com",
  "password": "Admin@123"
}

Response:
{
  "user": { ... },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <accessToken>
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJ..."
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <accessToken>
```

#### Change Password
```http
POST /auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "currentPassword": "Admin@123",
  "newPassword": "NewPassword@123"
}
```

### Centers

#### Get All Centers (Super Admin)
```http
GET /centers
Authorization: Bearer <accessToken>
```

#### Get My Center (Owner)
```http
GET /centers/my
Authorization: Bearer <accessToken>
```

#### Get Center by ID
```http
GET /centers/:id
Authorization: Bearer <accessToken>
```

#### Create Center (Super Admin Only)
```http
POST /centers
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Downtown Car Wash",
  "email": "downtown@carwash.com",
  "address": "123 Main St",
  "city": "Sousse",
  "state": "Sousse",
  "zipCode": "4000",
  "phone": "+216 73 123 456",
  "openTime": "08:00",
  "closeTime": "20:00",
  "capacity": 5,
  "latitude": 35.8256,
  "longitude": 10.6411,
  "amenities": ["WiFi", "Waiting Area", "Coffee"],
  "isActive": true
}
```

#### Update Center (Super Admin)
```http
PUT /centers/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{ ...updated fields... }
```

#### Update My Center (Owner)
```http
PUT /centers/my
Authorization: Bearer <accessToken>
Content-Type: application/json

{ ...updated fields... }
```

### Bookings

#### Get All Bookings
```http
GET /bookings?centerId=&customerId=&status=&dateFrom=&dateTo=&page=1&limit=10
Authorization: Bearer <accessToken>
```

#### Create Booking
```http
POST /bookings
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "centerId": "uuid",
  "customerId": "uuid",
  "vehicleId": "uuid",
  "scheduledDate": "2025-11-22T00:00:00Z",
  "scheduledTime": "14:00",
  "serviceIds": ["service-uuid-1", "service-uuid-2"]
}
```

#### Get Booking by ID
```http
GET /bookings/:id
Authorization: Bearer <accessToken>
```

#### Update Booking Status
```http
PATCH /bookings/:id/status
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

#### Assign Staff to Booking
```http
POST /bookings/:id/assign-staff
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "staffIds": ["staff-uuid-1", "staff-uuid-2"]
}
```

### Customers

#### Get All Customers
```http
GET /customers?page=1&limit=10&search=john
Authorization: Bearer <accessToken>
```

#### Create Customer
```http
POST /customers
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+216 12 345 678"
}
```

#### Get Customer Loyalty Points
```http
GET /customers/:id/loyalty
Authorization: Bearer <accessToken>
```

#### Add Loyalty Points
```http
POST /customers/:id/loyalty
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "points": 100,
  "reason": "Bonus points",
  "description": "Holiday promotion"
}
```

#### Get Customer Bookings
```http
GET /customers/:id/bookings?page=1&limit=10
Authorization: Bearer <accessToken>
```

#### Add Vehicle
```http
POST /customers/:id/vehicles
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "color": "Silver",
  "licensePlate": "TN-123456",
  "type": "SEDAN"
}
```

#### Get Customer Leaderboard
```http
GET /customers/leaderboard?limit=10
Authorization: Bearer <accessToken>
```

### Staff

#### Get All Staff
```http
GET /staff?centerId=&isActive=true&page=1&limit=10
Authorization: Bearer <accessToken>
```

#### Create Staff
```http
POST /staff
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "centerId": "center-uuid",
  "firstName": "Ahmed",
  "lastName": "Ben Ali",
  "email": "ahmed@carwash.com",
  "phone": "+216 12 345 678",
  "role": "WASHER",
  "hourlyRate": 15.50
}
```

#### Get Staff Performance
```http
GET /staff/:id/performance
Authorization: Bearer <accessToken>
```

#### Get Staff Schedule
```http
GET /staff/:id/schedule?dateFrom=2025-11-01&dateTo=2025-11-30
Authorization: Bearer <accessToken>
```

#### Create Shift
```http
POST /staff/:id/shifts
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "date": "2025-11-22T00:00:00Z",
  "startTime": "08:00",
  "endTime": "16:00"
}
```

#### Get Staff Leaderboard
```http
GET /staff/leaderboard?limit=10
Authorization: Bearer <accessToken>
```

### Dashboard

#### Get Overview
```http
GET /dashboard/overview
Authorization: Bearer <accessToken>
```

#### Get Revenue Trend
```http
GET /dashboard/revenue-trend?days=30
Authorization: Bearer <accessToken>
```

#### Get Today's Bookings
```http
GET /dashboard/bookings-today
Authorization: Bearer <accessToken>
```

#### Get Staff Performance
```http
GET /dashboard/staff-performance
Authorization: Bearer <accessToken>
```

#### Get Popular Services
```http
GET /dashboard/popular-services
Authorization: Bearer <accessToken>
```

#### Get Recent Activity
```http
GET /dashboard/recent-activity
Authorization: Bearer <accessToken>
```

### Public Endpoints (No Auth Required)

#### Get Nearby Centers
```http
GET /public/centers/nearby?lat=35.8256&lng=10.6411&radius=10
```

#### Get Center Services
```http
GET /public/centers/:id/services
```

---

## Frontend Guide

### Admin Panel Features

#### Super Admin Dashboard
**URL:** `http://localhost:3001/superadmin`

**Features:**
- View all centers with map locations
- Create new centers with interactive map picker
- Edit any center
- User management
- System analytics
- Full system control

#### Owner Dashboard
**URL:** `http://localhost:3001/owner`

**Features:**
- View and edit own center
- Staff management
- Booking management
- Performance analytics

### Map Picker (Center Management)

The map picker allows you to click on a map to set center coordinates:

1. Navigate to Super Admin → Centers
2. Click "+ Add New Center" or "Edit" on existing center
3. Click anywhere on the map to place marker
4. Coordinates auto-populate (latitude, longitude)
5. Fill in other details
6. Save

**Map Features:**
- OpenStreetMap tiles (free, no API key)
- Click to place marker
- Real-time coordinate display
- Pan and zoom
- Default location: Sousse, Tunisia (35.8256, 10.6411)

### Finding Coordinates

**Method 1: Google Maps**
1. Open Google Maps
2. Right-click on location
3. Click coordinates at top (they're copied)
4. Example: `48.8566, 2.3522`

**Method 2: Major Cities**
- Paris: 48.8566, 2.3522
- London: 51.5074, -0.1278
- New York: 40.7128, -74.0060
- Dubai: 25.2048, 55.2708

---

## Mobile App

### Features

**Customer App:**
- Browse nearby centers (map view)
- View services and pricing
- Book car wash appointments
- Track booking status
- Manage vehicles
- View loyalty points
- Earn badges
- View leaderboard
- Receive notifications

**Staff App:**
- View daily schedule
- Accept/complete assignments
- Update booking status
- View performance stats
- Check badges and ranking

### Mobile App API Usage

The mobile app calls:
```
GET /api/v1/public/centers/nearby?lat=USER_LAT&lng=USER_LNG&radius=10
```

Returns centers within 10km radius with:
- Center details
- Services
- Pricing
- Coordinates for map display

---

## Security

### Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secrets**: Use strong, unique secrets (32+ characters)
3. **Database**: Strong passwords, restricted access
4. **CORS**: Configure appropriate origins
5. **Rate Limiting**: Adjust based on needs
6. **HTTPS**: Always use SSL/TLS in production
7. **Passwords**: Enforce strong password policies (min 8 chars, special chars)

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### JWT Configuration

**Access Token:**
- Expires: 15 minutes
- Used for API requests

**Refresh Token:**
- Expires: 7 days
- Used to get new access token
- Stored in database (can be revoked)

---

## Deployment

### Production Environment Variables

```env
# Backend (.env)
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public&sslmode=require"
REDIS_HOST=redis-host
REDIS_PORT=6379
JWT_ACCESS_SECRET=<strong-32-char-secret>
JWT_REFRESH_SECRET=<strong-32-char-secret>
CORS_ORIGIN=https://yourdomain.com
API_PREFIX=api/v1

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

### Build Commands

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

### Database Migrations (Production)

```bash
# Use migrate deploy (non-interactive)
npx prisma migrate deploy
```

### Docker Production

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Troubleshooting

### Database Connection Issues

**Error:** "Can't reach database server"

**Solutions:**
1. Check PostgreSQL is running: `docker ps`
2. Verify DATABASE_URL in `.env`
3. Test connection: `npx prisma db execute --stdin`

### Migration Errors

**Error:** "Migration failed"

**Solutions:**
1. Reset database (dev only): `npx prisma migrate reset`
2. Delete migrations and regenerate:
   ```powershell
   Remove-Item -Recurse prisma/migrations
   npx prisma migrate dev --name init
   ```

### Port Already in Use

**Error:** "Port 5432 is already in use"

**Solutions:**
1. Stop existing PostgreSQL: `docker-compose down`
2. Change port in `docker-compose.yml`

### Prisma Client Out of Sync

**Error:** "Prisma Client is out of sync"

**Solution:**
```powershell
npx prisma generate
```

### Frontend Can't Connect to Backend

**Check:**
1. Backend is running: `http://localhost:3000/api/docs`
2. `.env.local` has correct API URL
3. CORS is configured correctly
4. No firewall blocking

### JWT Token Expired

**Error:** 401 Unauthorized

**Solution:**
1. Use refresh token endpoint
2. Re-login if refresh token expired
3. Check token expiration settings

### Map Not Loading

**Solutions:**
1. Check Leaflet CSS is imported in `layout.tsx`
2. Clear browser cache
3. Check browser console for errors

---

## Additional Resources

### Documentation Links
- **Prisma:** https://www.prisma.io/docs
- **NestJS:** https://docs.nestjs.com
- **Next.js:** https://nextjs.org/docs
- **Leaflet:** https://leafletjs.com
- **React Query:** https://tanstack.com/query/latest

### API Testing
- Swagger UI: `http://localhost:3000/api/docs`
- Use "Authorize" button with Bearer token

### Database GUI
- Prisma Studio: `npm run prisma:studio`
- Access: `http://localhost:5555`

---

## Workflows

### Complete Booking Flow

```
1. Customer selects center
   ↓
2. Choose services and vehicle
   ↓
3. Select date and time
   ↓
4. Create booking (status: PENDING)
   ↓
5. Admin/Owner reviews and confirms (status: CONFIRMED)
   ↓
6. Staff assigned to booking
   ↓
7. Booking starts (status: IN_PROGRESS)
   ↓
8. Service completed (status: COMPLETED)
   ↓
9. Payment processed
   ↓
10. Loyalty points awarded (10% cashback)
    ↓
11. Notification sent to customer
    ↓
12. Customer can leave review
```

### Adding a New Center

```
1. Super Admin logs in
   ↓
2. Navigate to Centers page
   ↓
3. Click "+ Add New Center"
   ↓
4. Click on map to set location
   ↓
5. Fill in center details
   ↓
6. Add amenities
   ↓
7. Click "Create Center"
   ↓
8. Center saved with coordinates
   ↓
9. Center appears on mobile app map
```

---

## Summary

**CarWash+ is a complete solution for:**
- Multi-center car wash operations
- Customer booking and loyalty management
- Staff scheduling and performance tracking
- Payment processing
- Real-time notifications
- Business analytics

**Key Benefits:**
- ✅ Production-ready code
- ✅ Full authentication and security
- ✅ Mobile-first customer experience
- ✅ Interactive map-based location management
- ✅ Gamification (loyalty points, badges, leaderboards)
- ✅ Real-time notifications
- ✅ Comprehensive API documentation
- ✅ Docker support for easy deployment

---

## Support

For issues and questions:
- Check Swagger API docs: `/api/docs`
- Review Prisma Studio: `localhost:5555`
- Check application logs: `backend/logs/`
- Review this documentation

---

**© 2025 CarWash+. All rights reserved.**  
**Built with ❤️ using NestJS, Next.js, and React Native**
