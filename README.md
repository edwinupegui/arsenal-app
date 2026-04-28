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

# Run dev server
npm run dev

# Seed database
npm run db:seed
```

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