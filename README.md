# vault-frontend

Web frontend for the vault-service -- a zero-knowledge secret management platform. Built with Next.js 16, shadcn/ui, and the vault SDK.

## Getting started

### Prerequisites

- [Bun](https://bun.com) >= 1.3
- A running instance of [vault-service](../vault-service)

### Setup

```bash
# Install dependencies
bun install

# Set the backend URL (defaults to http://localhost:3001)
echo 'NEXT_PUBLIC_API_URL=http://localhost:3001' > .env.local

# Start the dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server with Turbopack |
| `bun run build` | Build for production (standalone output) |
| `bun run start` | Start the production server |
| `bun run lint` | Run ESLint |

## Architecture

```
src/
├── app/
│   ├── (auth)/          # Login and registration pages
│   │   ├── login/
│   │   └── register/
│   ├── (app)/            # Authenticated routes
│   │   ├── projects/     # Project list, detail, environment secrets
│   │   └── settings/     # Account settings
│   ├── api/
│   │   ├── auth/         # NextAuth.js API routes
│   │   └── proxy/        # API proxy to vault-service
│   └── privacy/          # Legal pages
├── components/ui/        # shadcn/ui components (Button, Dialog, Table, etc.)
└── lib/
    ├── vault-sdk/        # Client-side encryption and API client
    ├── api.ts            # Backend API helpers
    ├── auth.ts           # NextAuth configuration
    ├── query-client.ts   # TanStack Query setup
    └── vault-store.ts    # Zustand state for vault operations
```

## Features

- **Zero-knowledge encryption** -- secrets are encrypted client-side before leaving the browser, using AES-256-GCM via the Web Crypto API
- **Project management** -- create projects, manage environments (production, staging, dev), and organize secrets per environment
- **Dark mode** -- automatic theme switching via `next-themes`
- **Responsive UI** -- built with shadcn/ui and Tailwind CSS v4
- **API proxy** -- Next.js route handler proxies requests to vault-service, keeping the backend URL internal

## Stack

| Concern | Library |
|---------|---------|
| Framework | Next.js 16 (App Router) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Components | @base-ui/react, lucide-react |
| Forms | @tanstack/react-form |
| Data fetching | @tanstack/react-query |
| Auth | next-auth v4 |
| State | zustand |
| Animations | motion |
| Toasts | sonner |
| Encryption | Web Crypto API (via vault SDK) |

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:3001` | Backend vault-service URL |
| `AUTH_SECRET` | Yes (prod) | -- | NextAuth secret for signing tokens |

## Docker

```bash
docker compose -f vault-frontend/docker-compose.yml up --build
```

Or build standalone:

```bash
docker build -f Dockerfile -t vault-frontend ..
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://vault-service:3001 \
  vault-frontend
```

## Related

- [vault-service](../vault-service) -- the backend API
- [vault-sdk](../vault-sdk) -- client-side encryption and API client library
