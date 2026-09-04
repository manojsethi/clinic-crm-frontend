# Clinic Registration Frontend

Web UI for walk-in clinic patient registration. Staff and doctors sign in to manage devices, registration sessions, patient submissions, clinical advice, and shared files. Patients use a public form opened from a QR code—no patient account required.

## Features

- Staff login with access/refresh token handling
- Role-based navigation for **admin**, **staff**, and **doctor**
- Admin device and staff/user management
- Registration setup: pair a clinic device with a doctor and show a live QR
- Public patient intake form (demographics, contact, medical details)
- Registration list with search and date filters; detail view with doctor advice
- File manager for uploads and shareable QR links
- Real-time QR updates over Socket.IO

## Stack

- React 19 + TypeScript
- Vite
- Ant Design + Tailwind CSS
- Axios
- Socket.IO client
- React Router

## Prerequisites

- Node.js 18+
- Backend API running (default `http://localhost:9003`)

## Quick start

```bash
cp .env.example .env
# Align URLs with your backend port and CORS settings
npm install
npm run dev
```

App URL: `http://localhost:5173`

## Environment

Copy `.env.example` to `.env`:

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_CLINIC_BACKEND_URL` | Backend origin (**no** `/api` suffix) | `http://localhost:9003` |
| `VITE_CLINIC_CLIENT_URL` | This app’s public origin (used in registration links) | `http://localhost:5173` |

Never commit `.env`. Only `.env.example` belongs in git.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite development server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

## Roles (UI)

| Role | Main areas |
|------|------------|
| Admin | Dashboard, staff management, patients, devices, registration setup, file manager |
| Doctor | Dashboard, own patients, advice editing, file manager |
| Staff | Dashboard, patient registrations |
| Patient | Public `/register?token=…` and public `/qr/:fileId` only |

## Main routes

| Path | Access | Purpose |
|------|--------|---------|
| `/login` | Public | Staff sign-in |
| `/register` | Public | Patient intake via QR token |
| `/qr/:fileId` | Public | Open shared file / link |
| `/dashboard` | Authenticated | Landing / status |
| `/registrations` | Authenticated | Patient list |
| `/registration-detail/:id` | Authenticated | Registration detail + advice |
| `/scan` | Admin (menu) | Start device–doctor registration session |
| `/registration-setup` | Admin session | Live QR display |
| `/users` | Admin | User management |
| `/devices` | Admin | Clinic devices |
| `/file-manager` | Admin / doctor (menu) | Files and shareable QR codes |

## Project layout

```
src/
├── components/   # Layout, QR display, protected route, forms
├── pages/        # Route-level screens
├── context/      # Auth and registration session context
├── services/     # Axios API client
├── hooks/        # Socket.IO hook
├── utils/        # Token helpers
└── types/        # Shared TypeScript types
```

## Auth behavior

1. Login stores tokens for the Axios client and uses credentialed cookies where the backend sets them.
2. On `401`/`403`, the client attempts refresh, then retries the request.
3. Failed refresh clears local session and returns to `/login`.

## Working with the backend

1. Start MongoDB and the backend (`npm run dev` in the backend repo).
2. Seed an admin user on the backend.
3. Set frontend `.env` URLs to match the backend port.
4. Ensure backend `CLINIC_CORS_ORIGIN` includes `VITE_CLINIC_CLIENT_URL`.

## Scope notes

This UI focuses on walk-in QR registration and light clinical follow-up. It does not include appointment scheduling, billing, or a logged-in patient portal.

## License

MIT
