# BaliEscape

A full-stack travel booking web app for discovering and booking curated travel packages across Bali.

**Live demo:** `https://bali-escape.vercel.app`
**Backend repo:** [bali-escape-api](https://github.com/gungdeari/bali-escape-api)

---

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Build tool:** Vite

---

## Features

### For travelers
- Browse curated Bali travel packages with search, filters, and sorting
- View package details with image galleries and ratings
- Multi-step booking flow with quantity selection
- Manual payment with proof-of-payment upload (bank transfer / e-wallet)
- Track booking status in real time (pending → waiting confirmation → confirmed)
- Download invoice PDF after confirmed payment
- Leave star ratings and written reviews on booked packages

### For admins
- Dashboard with booking stats and revenue overview
- Review uploaded payment proofs
- Confirm or cancel pending bookings
- Filter bookings by status

### Engineering highlights
- Role-based protected routing (`ProtectedRoute`, `PublicRoute`, `AdminRoute`)
- Token-based auth with persistent session across page refreshes
- Optimistic UI updates (e.g. reviews appear instantly on submit)
- Consistent loading / error / empty states across all data-fetching views
- Fully typed API layer with TypeScript

---

## Project Structure
src/
├── api/            # All API calls, grouped by resource
├── components/      # Reusable UI building blocks
├── contexts/         # Global state (AuthContext)
├── pages/             # Route-level page components
│   ├── auth/
│   └── admin/
├── routes/             # Route definitions + access control
└── services/            # Thin wrappers around auth API calls

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- The [bali-escape-api](https://github.com/yourusername/bali-escape-api) backend running locally

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/bali-escape-frontend.git
cd bali-escape-frontend

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Start the dev server
npm run dev
```

The app runs at `http://localhost:5173`

---

## Environment Variables

```env
VITE_API_URL=http://localhost:8000/api/v1
```

For production, set this to your deployed backend URL (e.g. the Railway domain).

---

## Test Accounts

Use these once the backend is seeded:

| Role | Email | Password |
|---|---|---|
| Admin | admin@mail.com | password |
| User | user@trvl.com | password |

---

## Deployment

Deployed on 