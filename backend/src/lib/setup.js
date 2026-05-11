require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { createId } = require('@paralleldrive/cuid2');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id                   TEXT PRIMARY KEY,
      first_name           TEXT NOT NULL,
      last_name            TEXT NOT NULL,
      phone                TEXT NOT NULL,
      email                TEXT,
      street_address       TEXT NOT NULL,
      city                 TEXT NOT NULL,
      state                TEXT NOT NULL,
      zip_code             TEXT NOT NULL,
      lawn_mowing          BOOLEAN NOT NULL DEFAULT false,
      lawn_mowing_date     TIMESTAMPTZ,
      dethatching          BOOLEAN NOT NULL DEFAULT false,
      dethatching_date     TIMESTAMPTZ,
      sprinkler_blowout    BOOLEAN NOT NULL DEFAULT false,
      sprinkler_blowout_date TIMESTAMPTZ,
      payment_method       TEXT NOT NULL,
      notes                TEXT,
      status               TEXT NOT NULL DEFAULT 'pending',
      admin_notes          TEXT,
      community_name       TEXT,
      created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS community_name TEXT`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id            TEXT PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name          TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourlawnco.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await pool.query(
    `INSERT INTO admins (id, email, password_hash, name, created_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (email) DO NOTHING`,
    [createId(), adminEmail, passwordHash, 'Owner']
  );

  console.log('Database tables created and admin user seeded.');
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
