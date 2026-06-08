# AdvutAI

AdvutAI is a production-ready SaaS AI workspace built with Next.js 15, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth, and OpenAI.

## Features

- ChatGPT-style AI chat with streaming responses
- Personal memory brain for user facts and preferences
- File intelligence for PDF, DOCX, and text uploads
- Task manager for productivity planning
- Google and Email login with NextAuth
- PostgreSQL database via Prisma
- Responsive modern UI with Tailwind CSS

## Getting Started

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Update `.env` with your PostgreSQL, NextAuth, and OpenAI credentials.

3. Install dependencies:

```bash
npm install
```

4. Generate Prisma client and apply migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Start the development server:

```bash
npm run dev
```

6. Open `http://localhost:3000` in your browser.

## Deployment

This application is ready for deployment on Vercel.

- Set the same environment variables in Vercel
- Use `npm run build` as the build command
- The output directory is handled automatically by Next.js

## Project Structure

- `src/app/` – Next.js App Router pages and API routes
- `src/components/` – reusable UI components
- `src/features/` – feature-specific components for chat, memory, files, and tasks
- `src/lib/` – Prisma and auth utilities
- `src/services/` – OpenAI API integration
- `prisma/schema.prisma` – database schema

## Notes

- Ensure PostgreSQL is reachable from your development environment.
- Use a strong secret for `NEXTAUTH_SECRET`.
- Upload file summaries are extracted for text, PDF, and DOCX content.
