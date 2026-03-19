# OurWay Frontend

Next.js 16 (App Router) frontend for OurWay — a family task manager with Kanban board and gamification.

## Tech Stack

- Next.js 16.2 (App Router, Turbopack by default)
- React 19.2+
- Tailwind CSS
- NextAuth.js (Google + credentials)
- next-intl (uk, en)
- next-pwa (PWA support)

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

App runs at http://localhost:3000

## Deploy

Deployed on Vercel. Every push to `main` triggers a new deployment.
