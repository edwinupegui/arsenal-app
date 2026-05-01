# Arsenal

**Arsenal** — Your curated technical resources manager for software development, AI, architecture, and gamedev.

![Arsenal Logo](public/arsenal-logo.svg)

## Stack

- **Astro 6** (SSR with Node adapter)
- **Tailwind CSS v4**
- **Drizzle ORM** with SQLite
- **Zod** for validation
- **TypeScript**

## Quick Start

```bash
# Install dependencies
npm install

# Configure env (copy .env.example to .env and fill in)
cp .env.example .env

# Run dev server
npm run dev

# Seed database
npm run db:seed
```

## Environment

Required variables in `.env`:

| Var | Purpose |
|-----|---------|
| `ADMIN_USER` | Admin username |
| `ADMIN_PASSWORD` | Admin password |
| `SESSION_SECRET` | 32+ char random string used to sign session cookies. Generate with `openssl rand -hex 32` |
| `DATABASE_URL` | (Optional) Path to SQLite file. Defaults to `./resources.db` |

In production (Fly.io), set them as secrets:

```bash
fly secrets set ADMIN_USER=... ADMIN_PASSWORD=... SESSION_SECRET=...
```

## Authentication

Session-based auth via HttpOnly cookies signed with HMAC-SHA256.

| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/auth/login` | POST | Public — sets session cookie |
| `/api/auth/logout` | POST | Public |
| `/api/auth/verify` | GET  | Reports current session state |
| `/api/resources` GET | — | Public |
| `/api/resources` POST/PUT/DELETE | — | Session required |
| `/login` | — | Public login form |
| `/recursos/new`, `/recursos/trash`, `/recursos/:id/{edit,delete,restore,permanent}` | — | Redirect to `/login` if no session |

## Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Start dev server at localhost:4321 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests (Vitest) |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio |

## Project Structure

```
src/
├── pages/
│   ├── index.astro          # Redirects to /recursos
│   ├── recursos/
│   │   ├── index.astro      # List all resources
│   │   ├── new.astro        # Create resource
│   │   ├── [id]/
│   │   │   ├── index.astro  # View resource
│   │   │   └── edit.astro   # Edit resource
│   │   └── trash.astro      # Soft-deleted resources
│   └── api/resources/
│       ├── index.ts         # GET (list) / POST (create)
│       └── [id]/
│           ├── index.ts     # GET / PUT / DELETE
│           ├── delete.ts    # Soft delete
│           ├── restore.ts   # Restore from trash
│           └── permanent.ts # Permanent delete
├── components/              # Astro components
├── layouts/
│   └── Layout.astro         # Main layout with nav
├── lib/
│   ├── resources.ts         # Data access layer (Drizzle)
│   ├── validation.ts        # Zod schemas
│   └── categories.ts        # Re-exports
├── repositories/           # Repository pattern
├── services/                # Service layer
└── db/
    ├── schema.ts            # Drizzle schema
    ├── index.ts             # DB connection
    └── seed.ts              # Seed from recursos.md
```

## Data Model

### Resource
- `title` — Resource title
- `url` — Link to resource
- `description` — Optional description
- `tags` — JSON array of tags
- `language` — 'ES' | 'EN'
- `type` — 'video' | 'article' | 'tool' | 'repo'
- `categoryId` — FK to category
- `createdAt` — ISO timestamp
- `deletedAt` — Soft delete (null = active)

### Category
- `id` — Auto-increment PK
- `name` — Category name
- `icon` — Icon identifier

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | List resources (supports `?q=`, `?categoryId=`, `?language=`, `?type=`) |
| POST | `/api/resources` | Create resource |
| GET | `/api/resources/:id` | Get single resource |
| PUT | `/api/resources/:id` | Update resource |
| DELETE | `/api/resources/:id` | Soft delete |
| POST | `/api/resources/:id/delete` | Soft delete |
| POST | `/api/resources/:id/restore` | Restore from trash |
| POST | `/api/resources/:id/permanent` | Permanent delete |

## Development Notes

- Database file: `resources.db` (SQLite)
- Migrations: `drizzle/` directory
- Resources file: `recursos.md` (source for seeding)
- Theme: Dark mode (#0f0f0f background, #6366f1 accent)

## License

MIT