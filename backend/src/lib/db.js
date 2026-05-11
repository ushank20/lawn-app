const { Pool } = require('pg');
const { createId } = require('@paralleldrive/cuid2');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── helpers ──────────────────────────────────────────────────────────────────

function row2booking(r) {
  if (!r) return null;
  return {
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    phone: r.phone,
    email: r.email,
    streetAddress: r.street_address,
    city: r.city,
    state: r.state,
    zipCode: r.zip_code,
    lawnMowing: r.lawn_mowing,
    lawnMowingDate: r.lawn_mowing_date,
    dethatching: r.dethatching,
    dethatchingDate: r.dethatching_date,
    sprinklerBlowout: r.sprinkler_blowout,
    sprinklerBlowoutDate: r.sprinkler_blowout_date,
    paymentMethod: r.payment_method,
    notes: r.notes,
    status: r.status,
    adminNotes: r.admin_notes,
    communityName: r.community_name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function row2admin(r) {
  if (!r) return null;
  return {
    id: r.id,
    email: r.email,
    passwordHash: r.password_hash,
    name: r.name,
    createdAt: r.created_at,
  };
}

// ── booking queries ───────────────────────────────────────────────────────────

async function createBooking(data) {
  const id = createId();
  const now = new Date();
  const { rows } = await pool.query(
    `INSERT INTO bookings (
      id, first_name, last_name, phone, email,
      street_address, city, state, zip_code,
      lawn_mowing, lawn_mowing_date,
      dethatching, dethatching_date,
      sprinkler_blowout, sprinkler_blowout_date,
      payment_method, notes, status, community_name,
      created_at, updated_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$20
    ) RETURNING *`,
    [
      id,
      data.firstName, data.lastName, data.phone, data.email ?? null,
      data.streetAddress, data.city, data.state, data.zipCode,
      data.lawnMowing, data.lawnMowingDate ?? null,
      data.dethatching, data.dethatchingDate ?? null,
      data.sprinklerBlowout, data.sprinklerBlowoutDate ?? null,
      data.paymentMethod, data.notes ?? null, 'pending', data.communityName ?? null,
      now,
    ]
  );
  return row2booking(rows[0]);
}

async function findBookings({ city, status, service, sortBy = 'created_at', sortOrder = 'desc' } = {}) {
  const conditions = [];
  const values = [];

  if (city) {
    values.push(`%${city}%`);
    conditions.push(`LOWER(city) LIKE LOWER($${values.length})`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (service === 'lawnMowing')      conditions.push('lawn_mowing = true');
  if (service === 'dethatching')     conditions.push('dethatching = true');
  if (service === 'sprinklerBlowout') conditions.push('sprinkler_blowout = true');

  const allowed = { createdAt: 'created_at', updatedAt: 'updated_at', firstName: 'first_name', city: 'city', status: 'status' };
  const col = allowed[sortBy] ?? 'created_at';
  const dir = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(`SELECT * FROM bookings ${where} ORDER BY ${col} ${dir}`, values);
  return rows.map(row2booking);
}

async function countBookings(where = {}) {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM bookings');
  return rows[0].total;
}

async function findBookingById(id) {
  const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
  return row2booking(rows[0]);
}

async function updateBooking(id, data) {
  const sets = [];
  const values = [];

  if (data.status !== undefined) {
    values.push(data.status);
    sets.push(`status = $${values.length}`);
  }
  if (data.adminNotes !== undefined) {
    values.push(data.adminNotes);
    sets.push(`admin_notes = $${values.length}`);
  }
  if (!sets.length) throw new Error('Nothing to update');

  values.push(new Date());
  sets.push(`updated_at = $${values.length}`);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE bookings SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values
  );
  return row2booking(rows[0]);
}

async function deleteBooking(id) {
  await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
}

async function groupBookingsByCity() {
  const { rows } = await pool.query(
    `SELECT city, COUNT(*)::int AS count FROM bookings GROUP BY city ORDER BY city ASC`
  );
  return rows;
}

// ── admin queries ─────────────────────────────────────────────────────────────

async function findAdminByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
  return row2admin(rows[0]);
}

async function upsertAdmin({ email, passwordHash, name }) {
  const id = createId();
  const now = new Date();
  const { rows } = await pool.query(
    `INSERT INTO admins (id, email, password_hash, name, created_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO NOTHING
     RETURNING *`,
    [id, email, passwordHash, name, now]
  );
  if (rows[0]) return row2admin(rows[0]);
  const { rows: existing } = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
  return row2admin(existing[0]);
}

module.exports = {
  createBooking, findBookings, countBookings,
  findBookingById, updateBooking, deleteBooking, groupBookingsByCity,
  findAdminByEmail, upsertAdmin,
};
