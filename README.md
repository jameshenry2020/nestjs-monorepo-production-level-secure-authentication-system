# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

#  Fullstack Auth System (NestJS + Next.js Monorepo)

A **production-grade authentication and authorization system** built with a modern fullstack architecture using **NestJS (backend)** and **Next.js (frontend)**.

This project goes beyond basic auth — it implements **secure, scalable, and event-driven authentication flows** with **RBAC**, **OAuth**, and **queue-based email processing**.

---

##  Features

###  Authentication
- Email & password authentication (JWT-based)
- Google OAuth login
- Email verification (OTP-based)

---

###  Password Management
- Forgot password (secure token flow)
- Reset password (token validation + expiry)
- Change password (authenticated users)

---

###  Authorization (RBAC)
- Role-based access control
- Permission system
- Default roles:
  - `admin`
  - `user`
- Guards & decorators (`@Roles`, `@Permissions`)

---

###  Event-Driven Email System
- Powered by **BullMQ + Redis**
- Background job processing
- Email flows:
  - Verification email
  - Password reset email

---

### Architecture Highlights
- Monorepo structure (backend + frontend)
- Modular NestJS architecture
- Clean separation of concerns
- Queue-driven async workflows
- Production-ready patterns

---

### Frontend (Next.js)
- Built with:
  - Tailwind CSS
  - shadcn/ui
- Pages:
  - Login
  - Signup
  - Email verification
  - Forgot password
  - Reset password
  - Change password

---

## Tech Stack

### Backend
- NestJS
- PostgreSQL
- Prisma
- JWT Authentication
- Passport (Google OAuth)
- BullMQ + Redis
- Argon2

### Frontend
- Next.js
- Tailwind CSS
- shadcn/ui

---

##  Environment Variables

Create a `.env` file in the backend:

```env
# App
PORT=3000

# JWT
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Internal
SERVER_PASSWORD=some_secure_fallback_password

