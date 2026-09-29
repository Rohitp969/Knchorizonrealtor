# MongoDB → Supabase PostgreSQL

This is the record of the database move made on 23 September 2026. Paths below are inside
`backend/`.

The KNC Horizon API now reads and writes Supabase PostgreSQL. MongoDB was **not** deleted:
it still holds every original document and remains the rollback source.

## What the API uses

| | |
|---|---|
| Driver | `pg` (node-postgres) — the direct counterpart of the `mongodb` driver this project already used. No ORM was introduced. |
| Connection | `DATABASE_URL`, Supavisor **session** pooler on port **5432**. Transaction pooling (6543) is not used: it does not support the prepared statements and multi-statement scripts here. |
| TLS | Always negotiated. Supavisor's certificate is signed by Supabase's own root, which is not in the public trust store, so the chain is not verified by default. Set `DATABASE_SSL_CA` to Supabase's CA certificate to turn full verification on. |
| Secrets | Read from `.env` only. Nothing is hardcoded; `.env` is gitignored. |

## Layout

```
src/lib/postgres.ts      pool, SSL, query/queryOne/count/transaction, id helpers
src/lib/schema.sql       tables, constraints, indexes (idempotent)
src/lib/repositories.ts  camelCase API field  <->  snake_case column, generic CRUD
src/lib/bootstrap.ts     applies the schema and the ADMIN_EMAIL account at start-up
src/lib/models.ts        *Doc (API shapes) and *Row (PostgreSQL row shapes)
```

Route files (`src/routes/*.ts`) were rewritten to parameterised SQL. **Every API path,
request shape and response shape is unchanged** — the frontend was not modified for this
migration.

### Ids

Each table's primary key is `text`, holding the original MongoDB ObjectId hex. New rows get
the same 24-character shape from `knc_new_id()` (`encode(gen_random_bytes(12),'hex')`), so
existing links, saved JWT subjects and admin references keep resolving.

### Relationships the document model only had as text

| Column | References | On delete |
|---|---|---|
| `projects.developer_slug` | `developers(slug)` | `set null` |
| `inquiries.property_id` | `properties(id)` | `set null` |
| `inquiries.project_id` | `projects(id)` | `set null` |

The original free-text columns (`projects.developer`, `inquiries.property_slug`,
`inquiries.project_slug`) are kept and still drive what is displayed, so a record whose
counterpart is missing or later deleted loses only the link, never its content.
`projects.developer_slug` is re-resolved on every admin create/update of a project.

## Running the server

```bash
npm run dev            # nodemon -> node src/index.ts, restarts on any src change
npm run dev:node-watch # same thing through Node's own --watch, no nodemon
npm start              # node src/index.ts  (TypeScript run directly)
npm run build          # esbuild bundle into dist/ (also copies schema.sql)
npm run start:bundle   # node dist/index.mjs
```

Nodemon is configured under `nodemonConfig` in package.json: it watches `src` for `.ts`,
`.json` and `.sql` changes and re-runs `node src/index.ts`. Typing `rs` in that terminal
forces a restart.

Node runs the TypeScript directly by stripping types (Node 22.6+; 23.6+ needs no flag). Two
consequences, both enforced by `npm run typecheck`:

- **Relative imports must carry the `.ts` extension** (`./app.ts`, not `./app`). Node's ESM
  resolver does not guess extensions. `allowImportingTsExtensions` in tsconfig lets tsc
  accept them; esbuild accepts them too, so the bundle still builds.
- **Only erasable syntax.** No `enum`, `namespace`, parameter properties or decorators —
  Node strips types, it does not compile them. `erasableSyntaxOnly` makes tsc reject these.

## Scripts

```bash
npm run db:export-mongo   # full JSON backup of MongoDB into backups/ (read-only)
npm run db:schema         # create/verify the PostgreSQL schema (idempotent)
npm run db:migrate        # copy every document into PostgreSQL, then verify counts
npm run db:verify         # verify counts only, writes nothing
npm run db:verify-data    # compare every field against the backup, record by record
npm run test:api          # exercise every public, lead, auth and admin endpoint
```

`db:migrate` upserts on the primary key, so it is safe to run again: it reconciles rather
than duplicating. It never writes to MongoDB.

## Verification recorded at migration time

- 13 collections, 95 documents → 13 tables, 95 rows. Counts equal.
- 95 records / 1,100 fields compared against the backup: identical. The only intentional
  difference is the `ADMIN_EMAIL` account's bcrypt hash, re-derived from `ADMIN_PASSWORD` at
  start-up exactly as the old seed did. Other users keep their migrated hashes, so existing
  passwords still work.
- 133 API tests pass, including admin create/read/update/delete round trips.
- 38 browser tests of the property search pass across Buy, Rent and Off-Plan.

## Move from Supabase to the company's own server (29 September 2026)

The database was copied from Supabase (PostgreSQL 17.6) to the company's own PostgreSQL 18.6
server, database `knc_db`. Nothing in the code depends on which of the two it talks to: the
API reads `DATABASE_URL` and connects with TLS either way.

| | |
|---|---|
| Tool | `backups/tools/copy-database.mjs` (on the owner's computer; `backups/` is not in git) |
| Reads | `OLD_DATABASE_URL`, in a read-only snapshot. The old database was not changed. |
| Writes | `DATABASE_URL`, in one transaction that is kept only if every row matches afterwards |
| Result | 15 tables, 279 rows, each identical on both servers (compared row by row, twice) |

Three things were made the same as on the old server:

- `inquiries.context` and `inquiries.source_path` (text, empty in every row) and the index
  `inquiries_email_created_idx` exist in the old database but not in `schema.sql`. They were
  created in the new one too. The code does not use them.
- The API had already made an administrator account of its own on the empty new server. It
  was turned into the old account of the same email (same id), because the SEO records refer
  to that id.

Checked afterwards, with the API running on the new database: all 13 public endpoints and 39
detail pages answer byte for byte what the live site answers (the sitemap lists the same 57
addresses), the administrator signs in, and every admin list shows the old counts.

### Switching the live site over

The live API keeps writing to the old database until Render is given the new address, so the
order matters:

1. `node backups/tools/copy-database.mjs copy` once more, to bring over what changed since.
2. Straight away, in Render > Environment, set `DATABASE_URL` to the new address and press
   Manual Deploy.
3. `node backups/tools/copy-database.mjs` (no `copy`) only reads. Do not run `copy` again once
   the site has been on the new database for a while: a row changed in both places keeps the
   version with the later date, but it is safer not to need that.

### What the own server needs that Supabase did for free

- **Backups.** Supabase made daily backups. On the own server a scheduled `pg_dump` (or the
  host's snapshot) has to be set up, and a restore tried once.
- **A strong password and a closed door.** Port 5432 is reachable from the internet. Use a
  long random password, and let the firewall accept only the addresses that need it.
- **Updates** of PostgreSQL and the operating system.

## Rolling back to MongoDB

The MongoDB database was never written to, so a rollback is a code change only. The two
MongoDB files, `src/lib/mongodb.ts` and `src/lib/seed.ts`, were removed from the code on
29 September 2026 because nothing used them; git history has them (last present in commit
`dbed2fc`).

1. `git checkout dbed2fc -- backend/src/lib/mongodb.ts backend/src/lib/seed.ts`
2. In `src/index.ts`, import `connectToMongo` from `./lib/mongodb` and `seedDatabase` from
   `./lib/seed`, and call those instead of `connectToPostgres()` / `bootstrapDatabase()`.
3. `git checkout` the pre-migration revision of `src/routes/*.ts`, `src/lib/auth.ts` and
   `src/lib/models.ts`.
4. `MONGODB_URI` / `MONGODB_DB` are still in `.env`, and the `mongodb` package is still a
   dependency.

Everything saved since 23 September 2026 (enquiries, SEO, Cloudinary photos) is only in
PostgreSQL, so a rollback would lose it.

The MongoDB database itself needs no restore: it was never written to. `backups/mongo-*/`
holds a point-in-time JSON copy if one is ever wanted.

## Seed data

The old demo seed is **not part of the code any more** (see above). Its content was
demo/sample data; the live records came from the migration and are the client's own.
Start-up only ensures the schema and the admin account.
