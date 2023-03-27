import { Domain, PrismaClient, Role } from '@prisma/client';
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

  // eslint-disable-next-line no-console
  console.log('\ndomains:', [development, design, marketing]);
};

const upsertUsers = async () => {
  const salt = await bcrypt.genSalt(Number(process.env.HASH_SALT) || 10);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
      domains: {
        connect: [{ name: Domain.DEVELOPMENT }, { name: Domain.DESIGN }],
      },
      isEmailValidated: true,
    },
  });

  // eslint-disable-next-line no-console
  console.log('\nusers:', [admin]);
};

const upsertProjects = async () => {
  const project = await prisma.projects.upsert({
    where: { name: 'Projet "Cocreate"' },
    update: {},
    create: {
      name: 'Projet "Cocreate"',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      domains: {
        connect: [
          { name: Domain.DEVELOPMENT },
          { name: Domain.DESIGN },
          { name: Domain.MARKETING },
        ],
      },
      members: {
        create: [
          {
            role: Role.OWNER,
            user: {
              connect: {
                email: 'edgarcresson@hotmail.com',
              },
            },
          },
        ],
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log('\nprojects:', [project]);
};

const upsertProjectsItems = async () => {
  const projectItem = await prisma.projectItems.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Développement de l'app",
      link: 'https://github.com/mdp-cocreate',
      author: {
        connect: { email: 'edgarcresson@hotmail.com' },
      },
      project: {
        connect: { name: 'Projet "Cocreate"' },
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log('\nprojectItems:', [projectItem]);
};

const upsertActions = async () => {
  const action = await prisma.actions.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'a créé le projet',
      project: {
        connect: {
          id: 1,
        },
      },
      author: {
        connect: {
          email: 'edgarcresson@hotmail.com',
        },
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log('\nactions:', [action]);
};

const main = async () => {
  await upsertDomains();
  await upsertUsers();
  await upsertProjects();
  await upsertProjectsItems();
  await upsertActions();
};

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
