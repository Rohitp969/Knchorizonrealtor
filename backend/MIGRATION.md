# MongoDB → Supabase PostgreSQL

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

## Rolling back to MongoDB

Nothing was removed, so a rollback is a code change only:

1. In `src/index.ts`, import `connectToMongo` from `./lib/mongodb` and `seedDatabase` from
   `./lib/seed`, and call those instead of `connectToPostgres()` / `bootstrapDatabase()`.
2. `git checkout` the previous revision of `src/routes/*.ts`, `src/lib/auth.ts` and
   `src/lib/models.ts`.
3. `MONGODB_URI` / `MONGODB_DB` are still in `.env`, and the `mongodb` package is still a
   dependency.

The MongoDB database itself needs no restore: it was never written to. `backups/mongo-*/`
holds a point-in-time JSON copy if one is ever wanted.

## Seed data

`src/lib/seed.ts` is retained for reference but is **no longer called**. Its content is
demo/sample data; the live records came from the migration and are the client's own. Running
it would overwrite edits made through the admin console. Start-up now only ensures the schema
and the admin account.
