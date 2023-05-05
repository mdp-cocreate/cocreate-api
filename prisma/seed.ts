import { Domain, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const upsertDomains = async () => {
  const uxuiDesign = await prisma.domains.upsert({
    where: { name: 'UXUI_DESIGN' },
    update: {},
    create: {
      name: 'UXUI_DESIGN',
    },
  });
  const development = await prisma.domains.upsert({
    where: { name: 'DEVELOPMENT' },
    update: {},
    create: {
      name: 'DEVELOPMENT',
    },
  });
  const graphicDesign = await prisma.domains.upsert({
    where: { name: 'GRAPHIC_DESIGN' },
    update: {},
    create: {
      name: 'GRAPHIC_DESIGN',
    },
  });
  const webmarketing = await prisma.domains.upsert({
    where: { name: 'WEBMARKETING' },
    update: {},
    create: {
      name: 'WEBMARKETING',
    },
  });
  const cybersecurity = await prisma.domains.upsert({
    where: { name: 'CYBERSECURITY' },
    update: {},
    create: {
      name: 'CYBERSECURITY',
    },
  });
  const data = await prisma.domains.upsert({
    where: { name: 'DATA' },
    update: {},
    create: {
      name: 'DATA',
    },
  });
  const audiovisual = await prisma.domains.upsert({
    where: { name: 'AUDIOVISUAL' },
    update: {},
    create: {
      name: 'AUDIOVISUAL',
    },
  });

  // eslint-disable-next-line no-console
  console.log('\ndomains:', [
    uxuiDesign,
    development,
    graphicDesign,
    webmarketing,
    cybersecurity,
    data,
    audiovisual,
  ]);
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
        connect: [{ name: Domain.DEVELOPMENT }, { name: Domain.UXUI_DESIGN }],
      },
      skills: JSON.stringify(['Typescript', 'Next.js', 'Nest.js']),
      isEmailValidated: true,
    },
  });
  const admin_bis = await prisma.users.upsert({
    where: { email: 'edgar.cresson@hotmail.com' },
    update: {},
    create: {
      email: 'edgar.cresson@hotmail.com',
      password: hash,
      firstName: 'Edgar',
      lastName: 'Cresson',
      country: 'France',
      domains: {
        connect: [{ name: Domain.CYBERSECURITY }, { name: Domain.DATA }],
      },
      skills: JSON.stringify(['Typescript', 'Next.js', 'Nest.js']),
      isEmailValidated: true,
    },
  });

  // eslint-disable-next-line no-console
  console.log('\nusers:', [admin, admin_bis]);
};

const upsertProjects = async () => {
  const project = await prisma.projects.upsert({
    where: { name: 'Projet "Cocreate"' },
    update: {},
    create: {
      name: 'Projet "Cocreate"',
      shortDescription: 'Courte description du projet',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      domains: {
        connect: [
          { name: Domain.DEVELOPMENT },
          { name: Domain.UXUI_DESIGN },
          { name: Domain.WEBMARKETING },
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

  const uiuxDesignProject = await prisma.projects.upsert({
    where: {
      name: 'UI/UX design project',
    },
    update: {},
    create: {
      name: 'UI/UX design project',
      shortDescription: 'Courte description du projet',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      domains: {
        connect: [{ name: Domain.UXUI_DESIGN }],
      },
      members: {
        create: [
          {
            role: Role.OWNER,
            user: {
              connect: {
                email: 'edgar.cresson@hotmail.com',
              },
            },
          },
        ],
      },
    },
  });

  const developmentProject = await prisma.projects.upsert({
    where: {
      name: 'Development project',
    },
    update: {},
    create: {
      name: 'Development project',
      shortDescription: 'Courte description du projet',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      domains: {
        connect: [{ name: Domain.DEVELOPMENT }],
      },
      members: {
        create: [
          {
            role: Role.OWNER,
            user: {
              connect: {
                email: 'edgar.cresson@hotmail.com',
              },
            },
          },
        ],
      },
    },
  });

  const graphicDesignProject = await prisma.projects.upsert({
    where: {
      name: 'Graphic design project',
    },
    update: {},
    create: {
      name: 'Graphic design project',
      shortDescription: 'Courte description du projet',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      domains: {
        connect: [{ name: Domain.GRAPHIC_DESIGN }],
      },
      members: {
        create: [
          {
            role: Role.OWNER,
            user: {
              connect: {
                email: 'edgar.cresson@hotmail.com',
              },
            },
          },
        ],
      },
    },
  });

  const webmarketingProject = await prisma.projects.upsert({
    where: {
      name: 'Webmarketing project',
    },
    update: {},
    create: {
      name: 'Webmarketing project',
      shortDescription: 'Courte description du projet',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      domains: {
        connect: [{ name: Domain.WEBMARKETING }],
      },
      members: {
        create: [
          {
            role: Role.OWNER,
            user: {
              connect: {
                email: 'edgar.cresson@hotmail.com',
              },
            },
          },
        ],
      },
    },
  });

  const cybersecurityProject = await prisma.projects.upsert({
    where: {
      name: 'Cybersecurity project',
    },
    update: {},
    create: {
      name: 'Cybersecurity project',
      shortDescription: 'Courte description du projet',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      domains: {
        connect: [{ name: Domain.CYBERSECURITY }],
      },
      members: {
        create: [
          {
            role: Role.OWNER,
            user: {
              connect: {
                email: 'edgar.cresson@hotmail.com',
              },
            },
          },
        ],
      },
    },
  });

  const dataProject = await prisma.projects.upsert({
    where: {
      name: 'Data project',
    },
    update: {},
    create: {
      name: 'Data project',
      shortDescription: 'Courte description du projet',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      domains: {
        connect: [{ name: Domain.DATA }],
      },
      members: {
        create: [
          {
            role: Role.OWNER,
            user: {
              connect: {
                email: 'edgar.cresson@hotmail.com',
              },
            },
          },
        ],
      },
    },
  });

  const audiovisualProject = await prisma.projects.upsert({
    where: {
      name: 'Audiovisual project',
    },
    update: {},
    create: {
      name: 'Audiovisual project',
      shortDescription: 'Courte description du projet',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      domains: {
        connect: [{ name: Domain.AUDIOVISUAL }],
      },
      members: {
        create: [
          {
            role: Role.OWNER,
            user: {
              connect: {
                email: 'edgar.cresson@hotmail.com',
              },
            },
          },
        ],
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log('\nprojects:', [
    project,
    uiuxDesignProject,
    developmentProject,
    graphicDesignProject,
    webmarketingProject,
    cybersecurityProject,
    dataProject,
    audiovisualProject,
  ]);
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
