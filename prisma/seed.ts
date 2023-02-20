import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const upsertDomains = async () => {
  const development = await prisma.domains.upsert({
    where: { name: 'DEVELOPMENT' },
    update: {},
    create: {
      name: 'DEVELOPMENT',
    },
  });
  const design = await prisma.domains.upsert({
    where: { name: 'DESIGN' },
    update: {},
    create: {
      name: 'DESIGN',
    },
  });
  const marketing = await prisma.domains.upsert({
    where: { name: 'MARKETING' },
    update: {},
    create: {
      name: 'MARKETING',
    },
  });
  console.log('\ndomains:', [development, design, marketing]);
};
const upsertUsers = async () => {
  const salt = await bcrypt.genSalt(Number(process.env.HASH_SALT) || 10);
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || '123', salt);
  const admin = await prisma.users.upsert({
    where: { email: 'edgarcresson@hotmail.com' },
    update: {},
    create: {
      email: 'edgarcresson@hotmail.com',
      password: hash,
      firstName: 'Edgar',
      lastName: 'Cresson',
      country: 'France',
      domains: { connect: [{ name: 'DEVELOPMENT' }, { name: 'DESIGN' }] },
    },
  });
  console.log('\nusers:', [admin]);
};

const main = async () => {
  await upsertDomains();
  await upsertUsers();
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
