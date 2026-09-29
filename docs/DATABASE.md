# Database

The KNC Horizon API keeps everything in one PostgreSQL database on the company's own server.
Paths below are inside `backend/`.

## What the API uses

| | |
|---|---|
| Driver | `pg` (node-postgres). No ORM. |
| Connection | `DATABASE_URL`, read from `.env` locally and from the host's environment when deployed. |
| TLS | Always negotiated. The server's certificate is its own, so the chain is not verified by default. Set `DATABASE_SSL_CA` to the server's CA certificate to turn full verification on. |
| Secrets | Read from the environment only. Nothing is hardcoded; `.env` is gitignored. |

## Layout

```
src/lib/postgres.ts      pool, TLS, query/queryOne/count/transaction, id helpers
src/lib/schema.sql       tables, constraints, indexes (idempotent)
src/lib/repositories.ts  camelCase API field  <->  snake_case column, generic CRUD
src/lib/bootstrap.ts     applies the schema and the ADMIN_EMAIL account at start-up
src/lib/models.ts        *Doc (API shapes) and *Row (PostgreSQL row shapes)
```

Every route (`src/routes/*.ts`) uses parameterised SQL.

### Tables

| Table | Holds |
|---|---|
| `properties`, `projects`, `developers`, `communities` | The listings and what they belong to |
| `posts`, `insights`, `gallery`, `testimonials` | Blog, market insights, gallery, client words |
| `inquiries`, `newsletter` | Enquiries and newsletter sign-ups from the website |
| `media` | The media library (every image uploaded to Cloudinary) |
| `users` | Sign-in accounts: administrators and SEO managers |
| `settings` | Site name, contact details, enquiry alert address (one row) |
| `seo_meta`, `seo_settings` | SEO console: one record per page, listing or article |

### Ids

Each table's primary key is `text`: 24 hexadecimal characters. New rows get one from
`knc_new_id()` (`encode(gen_random_bytes(12),'hex')`).

### Links between tables

| Column | References | On delete |
|---|---|---|
| `projects.developer_slug` | `developers(slug)` | `set null` |
| `inquiries.property_id` | `properties(id)` | `set null` |
| `inquiries.project_id` | `projects(id)` | `set null` |
| `seo_meta.property_id`, `project_id`, `post_id` | the listing or article | `cascade` |

The free-text columns beside them (`projects.developer`, `inquiries.property_slug`,
`inquiries.project_slug`) are kept and still drive what is displayed, so a record whose
counterpart is missing or later deleted loses only the link, never its content.

## What happens at start-up

`bootstrap.ts` runs `schema.sql` (it only creates what is missing) and makes sure the account
named in `ADMIN_EMAIL` exists with the password in `ADMIN_PASSWORD`. It never adds, changes
or removes content.

## Running the server

```bash
npm run dev            # nodemon -> node src/index.ts, restarts on any src change
npm run dev:node-watch # same thing through Node's own --watch, no nodemon
npm start              # node src/index.ts  (TypeScript run directly)
npm run build          # esbuild bundle into dist/ (also copies schema.sql)
npm run start:bundle   # node dist/index.mjs
```

Node runs the TypeScript directly by stripping types. Two consequences, both enforced by
`npm run typecheck`:

- **Relative imports must carry the `.ts` extension** (`./app.ts`, not `./app`).
- **Only erasable syntax.** No `enum`, `namespace`, parameter properties or decorators.

## Scripts

```bash
npm run db:schema    # create/verify the schema (idempotent)
npm run test:api     # exercise every public, lead, auth and admin endpoint
npm run test:email   # send one test email with the SMTP_* settings in .env
```

## Looking after the server

The database runs on a server the company manages itself, so these are the company's to do:

- **Backups.** Schedule a daily `pg_dump` (or the host's snapshot), keep copies away from
  the server, and try a restore once.
- **A strong password and a closed door.** Port 5432 is reachable from the internet. Use a
  long random password, and let the firewall accept only the addresses that need it.
- **Updates** of PostgreSQL and the operating system.

## Where the data came from

The database was moved to this server on 29 September 2026 from the hosted PostgreSQL the
site used before, row for row (15 tables, every row compared on both sides). Two columns that
only the earlier database had, `inquiries.context` and `inquiries.source_path`, and the
index `inquiries_email_created_idx` were created here as well; the code does not use them.

Copies of the earlier databases are kept on the owner's computer in `backend/backups/`, which
is not in git. `backend/backups/README.md` says what each folder is.
