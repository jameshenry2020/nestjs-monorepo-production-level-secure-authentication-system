# Fullstack Enterprise Secure Authentication & Collaborative Org System

A production-grade, highly scalable, and modular authentication, authorization, and multi-tenant organization collaboration system. Built with a modern fullstack architecture, this platform leverages **NestJS** for a secure backend API, **Next.js** for an interactive frontend client, and **Turborepo** for monorepo speed and management.

This system goes far beyond basic auth. It implements a robust, dual-authorization scope (Personal vs. Organization context), fine-grained Permission-Based Access Control (PBAC), OAuth integrations, asynchronous event-driven email notifications, and GitHub-style team collaboration.

---

##  System Capabilities

### 1. Tenant Organization & Team Collaboration
*   **Organization Creation:** Users can spin up multiple organizations. Automated, URL-safe slug generation ensures seamless routing.
*   **Asynchronous Invitation System:** Invite team members by email address. Invitations are processed as background jobs using **BullMQ + Redis** and dispatch custom transactional invitation emails.
*   **Collaborative Roles & Lifecycle:** Pre-configured organization roles (`owner` and `member`) define what members can do.
*   **Orphan Protection:** Built-in safeguards prevent leaving or deleting the last owner of an organization to ensure continuity.

### 2. Dual-Authorization Scope Engine
*   **Personal Scope:** Default mode where users manage their own personal resources (e.g., personal projects, profile configuration, direct settings).
*   **Organization Scope:** Activated dynamically by sending an `X-Organization-Id` header (or route-specific path parameters). Endpoints adapt automatically to check permissions and associate newly created resources with the active organization context.
*   **Context Injection:** An custom `OrganizationContextGuard` resolves the organization, validates the user's membership, extracts their role's permissions, and attaches the active context to the Request object.

### 3. Fine-Grained Permission-Based Access Control (PBAC)
*   **Granular System-Wide Permissions:** Permissions (e.g., `project.create`, `users.manage`, `org.members.invite`) mapped out across modules.
*   **Role-Permission Mapping:** Roles act as bundles of permissions. Admins can update roles and re-link permissions dynamically.
*   **Direct User Overrides:** Supports assigning specific, direct permissions to individual users, bypassing or supplementing their standard role's permission set.
*   **Custom Guards & Decorators:** Protect endpoints using `@Roles('admin')` or `@Permissions('project.create')` alongside NestJS guards.

### 4. Authentication & Security
*   **Local Password Authentication:** Fully secure signup & sign-in with **Argon2** password hashing.
*   **Google OAuth 2.0:** Integrated using Passport strategy (`passport-google-oauth20`) featuring conflict handling to prevent duplicate or conflicting accounts for existing emails.
*   **Password Lifecycle Management:** Secure, short-lived tokens for "Forgot Password" flows, custom token invalidation, and password updates for authenticated sessions.
*   **OTP-Based Email Verification:** Verification requirement on registration, complete with code expiration and rate-limited resend options.

###  5. Event-Driven Messaging Queue
*   **Non-Blocking APIs:** High-throughput backend architecture. Time-consuming tasks like sending emails are offloaded to **BullMQ** running on a **Redis** queue.

### 6. Multi-Factor / Two-Factor Authentication (MFA / 2FA)
*   **TOTP-Based 2FA:** Users can secure their accounts using standard Time-based One-Time Passwords (TOTP) compatible with Google Authenticator, Authy, or other authenticator apps.
*   **Encrypted Secret Storage:** 2FA secrets are cryptographically encrypted using AES-256-CBC with a server-side encryption key before being stored in the database.
*   **Recovery Backup Codes:** Automatically generates 10 single-use, hashed recovery backup codes upon enabling MFA. Users can download or copy these codes to authenticate in case they lose access to their authenticator device.
*   **Dual-Stage Verification Flow:** Login endpoints return a temporary, scoped 2FA-pending JWT if the user has MFA enabled. The client must then exchange this temporary token along with a valid TOTP/backup code for standard access and refresh tokens.

---

##  Architecture & Tech Stack

The monorepo is managed via **Turborepo** with a clean separation of concerns:

```text
secure-authentication-system/
├── apps/
│   ├── api/                # NestJS Backend Application (Swagger, Prisma ORM, BullMQ)
│   └── web/                # Next.js Frontend Application (App Router, Zustand, React Query)
├── packages/
│   ├── ui/                 # Shared Tailwind UI components (shadcn/ui layout)
│   ├── eslint-config/      # Shared ESLint configuration
│   └── typescript-config/  # Shared TypeScript configuration
```

### Backend (NestJS)
*   **Core:** NestJS modular architecture (`src/modules/*` split by domain).
*   **ORM / Database:** Prisma ORM connecting to PostgreSQL.
*   **Queueing:** BullMQ + Redis for asynchronous background tasks.
*   **Auth & Security:** Passport.js (JWT, Local, and Google OAuth strategy), Argon2 for password hashing.
*   **Docs:** Swagger UI automatically generated at `/api/docs`.

### Frontend (Next.js)
*   **Core:** Next.js 14 (App Router) using React Server Components (RSC) and Client Components.
*   **State & Cache:** Zustand for local client-side UI states; TanStack React Query for caching and sync with the API layer.
*   **Styling:** Tailwind CSS + shadcn/ui.
*   **Client:** Axios instance configured with global interceptors.

---

##  Database Schema Relationships

The system uses a highly normalized PostgreSQL database. The diagram below illustrates how roles, permissions, memberships, and resource scopes are linked.

```mermaid
erDiagram
    User ||--o{ OtpCode : "owns"
    User ||--o{ PasswordResetToken : "owns"
    User }|--o| Role : "global_role"
    User ||--o{ UserPermission : "direct_permissions"
    User ||--o{ OrganizationMember : "memberships"
    User ||--o{ OrganizationInvitation : "sent_invitations"
    User ||--o{ Project : "personal_projects"
    User ||--o| UserTwoFactor : "two_factor_auth"

    Role ||--o{ RolePermission : "has"
    Role ||--o{ User : "assigned_to"
    Role ||--o{ OrganizationMember : "used_by"
    Role ||--o{ OrganizationInvitation : "preassigned_to"

    Permission ||--o{ RolePermission : "granted_to_roles"
    Permission ||--o{ UserPermission : "granted_to_users"

    Organization ||--o{ OrganizationMember : "has_members"
    Organization ||--o{ OrganizationInvitation : "has_invitations"
    Organization ||--o{ Role : "defines_custom_roles"
    Organization ||--o{ Project : "owns_projects"

    OrganizationMember }|--|| Role : "org_role"
    OrganizationInvitation }|--|| Role : "invitation_role"
```

---

##  Dual-Scope Context Resolver

The backend dynamically checks permissions based on context. Setting the `X-Organization-Id` header routes permission checks through the organization context instead of the personal account:

```typescript
// Example from apps/api/src/common/guards/permissions.guard.ts
if (organizationContext && organizationContext.type === 'ORGANIZATION') {
  // ORGANIZATION SCOPE: Only check organization-specific permissions from membership role
  const role = organizationContext.role;
  if (role && role.rolePermissions) {
    role.rolePermissions.forEach((rp) => {
      if (rp.permission) permissionsSet.add(rp.permission.name);
    });
  }
} else {
  // PERSONAL SCOPE: Check user's direct permissions and global role permissions
  // (Adds user.rolePermissions + user.role.rolePermissions)
}
```

---

##  API Reference

Below are the primary endpoints exposed by the NestJS application:

###  Authentication Module (`/auth`)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | No | Registers a new user account. Defaults role to `user`. |
| `POST` | `/auth/otp-verification` | No | Verifies email using OTP sent during registration. |
| `POST` | `/auth/resend-otp` | No | Generates and resends a new OTP. |
| `POST` | `/auth/sign-in` | No | Authenticates user credentials and returns a JWT. |
| `GET` | `/auth/google` | No | Initiates Google OAuth authentication flow. |
| `GET` | `/auth/google/callback` | No | Callback endpoint for Google OAuth authentication. |
| `GET` | `/auth/profile` | JWT | Returns current authenticated user details. |
| `POST` | `/auth/logout` | JWT | Clears session cookie/tokens. |
| `POST` | `/auth/forgot-password` | No | Dispatches a password reset link to user email. |
| `POST` | `/auth/reset-password` | No | Resets password using the token sent to email. |
| `POST` | `/auth/change-password` | JWT | Allows changing the password by validating current one. |
| `POST` | `/auth/2fa/setup` | JWT | Initiates 2FA setup by generating a secret and QR Code. |
| `POST` | `/auth/2fa/enable` | JWT | Enables 2FA by verifying the setup code and returns recovery backup codes. |
| `POST` | `/auth/2fa/disable` | JWT | Disables 2FA by validating the code. |
| `POST` | `/auth/2fa/authenticate` | No | Authenticates login using 2FA code and temporary token. |

### Organization Module (`/organizations`)

| Method | Endpoint | Auth Required | Scope Checked | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/organizations` | JWT | Personal | Creates a new organization and assigns creator as `owner`. |
| `GET` | `/organizations` | JWT | Personal | Lists all organizations the authenticated user belongs to. |
| `GET` | `/organizations/:id/members` | JWT | Org Member | Returns the list of members of the organization. |
| `POST` | `/organizations/:id/invitations` | JWT | Org Owner | Invites a user via email. Dispatches invitation link asynchronously. |
| `POST` | `/organizations/invitations/:token/accept` | JWT | Personal | Accepts invitation token and joins the organization. |
| `POST` | `/organizations/invitations/:token/reject` | JWT | Personal | Rejects/declines invitation token. |
| `PUT` | `/organizations/:id/members/:userId/role` | JWT | Org Owner | Updates organization member's role (promotes/demotes). |
| `DELETE` | `/organizations/:id/members/:userId` | JWT | Org Owner/Self | Removes a member or leaves the organization. |

### Permission Management (`/permissions`) - *System Admin Only*

| Method | Endpoint | Auth Required | Decorator Protection | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/permissions` | JWT | `@Roles('admin')` | Creates a new system-wide permission. |
| `GET` | `/permissions` | JWT | `@Roles('admin')` | Lists all permissions. |
| `POST` | `/permissions/roles/:roleId` | JWT | `@Roles('admin')` | Assigns system permission(s) to a role. |
| `DELETE` | `/permissions/roles/:roleId` | JWT | `@Roles('admin')` | Revokes permission(s) from a role. |
| `POST` | `/permissions/users/:userId` | JWT | `@Roles('admin')` | Assigns direct permission(s) to a user. |
| `DELETE` | `/permissions/users/:userId` | JWT | `@Roles('admin')` | Revokes direct permission(s) from a user. |

### Projects Module (`/projects`) - *Dual Scope*

| Method | Endpoint | Auth Required | Permissions Checked | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/projects` | JWT | `project.create` \| `org.projects.create` | Creates a project under the active scope. |
| `GET` | `/projects` | JWT | `project.read` \| `org.projects.read` | Lists all projects matching the active scope. |
| `GET` | `/projects/:id` | JWT | `project.read` \| `org.projects.read` | Retrieves details for a specific project. |

*Note: For the Projects Module, if `X-Organization-Id` is provided in the headers, it will check the organization permissions and associate the project with the organization. Otherwise, it behaves as a personal project.*

---

## Getting Started

### Prerequisites
*   **Node.js:** v18 or higher
*   **Package Manager:** `pnpm` (v9+)
*   **Database:** PostgreSQL
*   **In-Memory Store:** Redis (Required for BullMQ queues)

### 1. Installation
Clone the repository and install all workspaces dependencies:
```bash
git clone <repository-url>
cd secure-authentication-system
pnpm install
```

### 2. Configure Environment Variables
Create a `.env` file inside `apps/api/.env` and populate:
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/auth_db?schema=public"

# JWT configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1h

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Redis Queue Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Fallback Password for OAuth Registration
SERVER_PASSWORD=some_secure_fallback_password

# Two-Factor Authentication Encryption Key
TWO_FACTOR_ENCRYPTION_KEY=a-very-secure-32-character-key-for-2fa
```

### 3. Database Initialization
Run Prisma migrations and apply the seed script to populate roles, standard global scopes, and organization permissions:
```bash
cd apps/api
pnpm prisma migrate dev
pnpm ts-node prisma/seed.ts
```

### 4. Running the Application
From the project root, start both applications concurrently in development mode using Turborepo:
```bash
pnpm dev
```
*   **Backend API:** `http://localhost:3001`
*   **Swagger API Docs:** `http://localhost:3001/documentation`
*   **Frontend Client:** `http://localhost:3000` (or `http://localhost:3001` depending on port resolution)

---

##  Security Best Practices

1.  **Strict Context Isolation:** Security contexts are resolved before permission validation. If a user sets a fake `X-Organization-Id`, the guard will throw a `ForbiddenException` immediately since they lack an active database membership.
2.  **No Plaintext Secrets:** Passwords hashed with `Argon2` at the model boundary.
3.  **Scoped Tokens:** Forgot-password and invitation tokens are cryptographically generated (`crypto.randomBytes`), hashed in the database, and bound to brief TTLs (Time-To-Live).
4.  **Asynchronous Decoupling:** BullMQ runs outside the main thread context, preventing email server timeouts or SMTP failures from lagging or dropping API request pipelines.
5.  **Global Type-Safety:** Input payloads are strictly validated using `class-validator` and `ValidationPipe`.
