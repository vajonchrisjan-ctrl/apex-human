import { Pool } from "@neondatabase/serverless";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "..", "lib", "db", "migrations");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log("No DATABASE_URL set — skipping migrations.");
    return;
  }

  const pool = new Pool({ connectionString });

  await pool.query(`
    create table if not exists _migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const { rows: applied } = await pool.query("select name from _migrations");
  const appliedNames = new Set(applied.map((r) => r.name));

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (appliedNames.has(file)) {
      console.log(`Already applied: ${file}`);
      continue;
    }
    const sql = readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`Applying ${file}...`);
    await pool.query(sql);
    await pool.query("insert into _migrations (name) values ($1)", [file]);
    console.log(`Applied ${file}`);
  }

  console.log("Migrations up to date.");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
