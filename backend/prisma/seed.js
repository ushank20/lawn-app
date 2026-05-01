const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'changeme123', 10);

  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@yourlawnco.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@yourlawnco.com',
      passwordHash,
      name: 'Owner',
    },
  });

  console.log('Admin user seeded.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
