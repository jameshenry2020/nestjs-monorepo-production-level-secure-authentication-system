# 🧠 AI Agent Task: Secure Auth System Enhancement (NestJS + Next.js Monorepo)

## 📌 Project Context
You are working inside a **NestJS + Next.js monorepo**.

### Backend Architecture Notes (IMPORTANT)

- Uses **BullMQ + Redis** for background jobs
- Email sending is **event-driven via queue**
- There is an existing email consumer:

### Backend (NestJS)
Already implemented:
- ✅ User registration
- ✅ Login (JWT-based)
- ✅ Email verification (OTP or token-based)

User model includes:
- `email`
- `password`
- `provider` (enum: `email | google`, default = `email`)
- other relevant fields (e.g. name)

### Frontend (Next.js)
- Needs authentication UI built from scratch

---

## 🎯 Objectives

### 1. 🔐 Implement Google OAuth Strategy (Backend)

#### Requirements:
- Integrate Google OAuth using Passport strategy (`passport-google-oauth20`)
#### Flow Logic:
1. When user authenticates via Google:
   - Extract:
     - Email
     - First name
     - Last name

2. Check database:
   - If user exists **AND provider = `google`**:
     - Log them in
     - Generate JWT using existing login method

   - If user exists **BUT provider = `email`**:
     - Handle conflict safely (do NOT overwrite account)
     - Return appropriate error or message

   - If user does NOT exist:
     - Create new user:
       - `email` from Google
       - `name` from Google profile
       - `provider = google`
       - `password = process.env.SERVER_PASSWORD` (hashed)

3. After successful auth:
   - Return JWT token (reuse existing JWT logic)

#### Implementation Notes:
- Use NestJS Guards and Passport strategy pattern
- Keep logic modular (AuthService, UsersService separation)
- Ensure password is always hashed even if it's from `.env`
- Validate email presence from Google response

---


### 2. 🖥️ Build Frontend Auth UI (Next.js)

#### Tech Stack:
- Tailwind CSS
- shadcn/ui component library

#### Pages to Create:

##### 🔑 Login Page
- Email + password login form
- "Login with Google" button
- Error handling UI
- Link to signup page

##### 📝 Signup Page
- Name, email, password inputs
- Submit to backend register endpoint
- Link to login page

##### ✉️ Email Verification Page
- OTP or token input field
- Resend verification option
- Success/error states

---

### 3. 🔗 Frontend ↔ Backend Integration

- Connect forms to backend endpoints:
  - `/auth/login`
  - `/auth/register`
  - `/auth/verify-email`
  - `/auth/google` (OAuth start)
  - `/auth/google/callback`

- Store JWT securely (HTTP-only cookie or safe client storage)
- Handle redirects after login/signup

---

## ⚙️ Constraints & Best Practices

- Follow clean architecture principles
- Keep code modular and reusable
- Do NOT break existing email/password auth flow
- Use environment variables securely
- Validate all inputs (both frontend & backend)
- Handle edge cases (duplicate emails, missing Google data)

---

## ✅ Expected Output

### Backend:
- Google OAuth strategy fully implemented
- Auth flow integrated with existing JWT system
- Clean, maintainable NestJS modules

### Frontend:
- Fully functional auth pages
- Clean UI using Tailwind + shadcn
- Smooth UX for login, signup, verification, OAuth

---

## 🚀 Bonus (Optional Enhancements)
- Add loading states for async actions
- Add toast notifications for feedback
- Add route protection (auth guards on frontend)
- Improve accessibility of forms

---

## 🧩 Summary

You are extending an existing authentication system by:
1. Adding **Google OAuth login**
2. Building a **modern authentication UI**
3. Ensuring seamless integration with existing JWT-based backend

Focus on **security, clarity, and maintainability**.


# 2. 🔑 Password Management System

## Features to Implement

### A. Forgot Password
- Endpoint: `POST /auth/forgot-password`
- Input: email
- Flow:
  - Validate user exists
  - Generate secure token (short expiry)
  - Store hashed token + expiry
  - Send reset link via email

---

### B. Reset Password
- Endpoint: `POST /auth/reset-password`
- Input:
  - token
  - new password

- Flow:
  - Validate token + expiry
  - Hash new password
  - Update user password
  - Invalidate token

---

### C. Change Password (Authenticated)
- Endpoint: `POST /auth/change-password`
- Requires JWT auth

- Input:
  - current password
  - new password

- Flow:
  - Validate current password
  - Hash and update new password

---

## Security Requirements
- Always hash passwords (bcrypt)
- Tokens must be:
  - Random
  - Hashed in DB
  - Expire (e.g. 15–30 mins)
- Prevent user enumeration in forgot password response

---

# 3. 🛡️ Role & Permission System (RBAC)

## Requirements
Implement a **production-grade RBAC system**.

### Entities

#### Role
- `id`
- `name` (e.g. `admin`, `user`)
- `permissions` (array or relation)

#### Permission
- `id`
- `name` (e.g. `manage_users`, `view_dashboard`)

#### User
- Must reference a Role

---

## Default Roles (Seed Data)
- `admin`
- `user`

---

## Behavior

### Signup (Local + Google)
- Assign default role: `user`

---

### Authorization System
- Create:
  - Role Guard
  - Permission Guard
  - Custom decorators:
    - `@Roles()`
    - `@Permissions()`

---

### Usage Example
```ts
@Roles('admin')
@Get('/admin-only')