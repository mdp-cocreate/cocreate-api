import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const developmentDomain = await prisma.domains.upsert({
    where: { name: 'DEVELOPMENT' },
    update: {},
    create: {
      name: 'DEVELOPMENT',
    },
  });
  const designDomain = await prisma.domains.upsert({
    where: { name: 'DESIGN' },
    update: {},
    create: {
      name: 'DESIGN',
    },
  });
  const marketingDomain = await prisma.domains.upsert({
    where: { name: 'MARKETING' },
    update: {},
    create: {
      name: 'MARKETING',
    },
  });
  console.log({ developmentDomain, designDomain, marketingDomain });

  const admin = await prisma.users.upsert({
    where: { email: 'edgarcresson@hotmail.com' },
    update: {},
    create: {
      email: 'edgarcresson@hotmail.com',
      password: '123',
      firstName: 'Edgar',
      lastName: 'Cresson',
      country: 'France',
      domains: { connect: [{ name: 'DEVELOPMENT' }, { name: 'DESIGN' }] },
    },
  });
  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
