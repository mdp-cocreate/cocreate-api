import { PrismaClient, DomainName, SkillName, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { edgar } from './images/edgar';
import { cocreate } from './images/cocreate';
import { theo } from './images/theo';

function base64ToBuffer(base64Image: string): Buffer {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  return buffer;
}

const prisma = new PrismaClient();

async function seed() {
  try {
    // Domains
    await prisma.domain.createMany({
      data: [
        { name: DomainName.UXUI_DESIGN },
        { name: DomainName.DEVELOPMENT },
        { name: DomainName.GRAPHIC_DESIGN },
        { name: DomainName.WEBMARKETING },
        { name: DomainName.CYBERSECURITY },
        { name: DomainName.DATA },
        { name: DomainName.AUDIOVISUAL },
      ],
    });

    // Skills
    await prisma.skill.createMany({
      data: [
        // UXUI_DESIGN
        { name: SkillName.USER_RESEARCH, domainId: 1 },
        { name: SkillName.WIREFRAMING, domainId: 1 },
        { name: SkillName.INTERACTIVE_PROTOTYPING, domainId: 1 },
        { name: SkillName.USER_CENTERED_DESIGN, domainId: 1 },
        { name: SkillName.INTERACTION_DESIGN, domainId: 1 },

        // DEVELOPMENT
        { name: SkillName.WEB_DEVELOPMENT, domainId: 2 },
        { name: SkillName.MOBILE_DEVELOPMENT, domainId: 2 },
        { name: SkillName.FRONTEND_DEVELOPMENT, domainId: 2 },
        { name: SkillName.BACKEND_DEVELOPMENT, domainId: 2 },
        { name: SkillName.DATABASE_MANAGEMENT, domainId: 2 },

        // GRAPHIC_DESIGN
        { name: SkillName.TYPOGRAPHY, domainId: 3 },
        { name: SkillName.BRAND_IDENTITY_DESIGN, domainId: 3 },
        { name: SkillName.ILLUSTRATION, domainId: 3 },
        { name: SkillName.LAYOUT_DESIGN, domainId: 3 },
        { name: SkillName.COLOR_THEORY, domainId: 3 },

        // WEBMARKETING
        { name: SkillName.DIGITAL_STRATEGY, domainId: 4 },
        { name: SkillName.SEO_OPTIMIZATION, domainId: 4 },
        { name: SkillName.SOCIAL_MEDIA_MARKETING, domainId: 4 },
        { name: SkillName.CONTENT_MARKETING, domainId: 4 },
        { name: SkillName.ANALYTICS_TRACKING, domainId: 4 },

        // CYBERSECURITY
        { name: SkillName.NETWORK_SECURITY, domainId: 5 },
        { name: SkillName.THREAT_ANALYSIS, domainId: 5 },
        { name: SkillName.INCIDENT_RESPONSE, domainId: 5 },
        { name: SkillName.VULNERABILITY_ASSESSMENT, domainId: 5 },
        { name: SkillName.CRYPTOGRAPHY, domainId: 5 },

        // DATA
        { name: SkillName.DATA_ANALYSIS, domainId: 6 },
        { name: SkillName.DATA_VISUALIZATION, domainId: 6 },
        { name: SkillName.MACHINE_LEARNING, domainId: 6 },
        { name: SkillName.DATA_ENGINEERING, domainId: 6 },
        { name: SkillName.STATISTICAL_MODELING, domainId: 6 },

        // AUDIOVISUAL
        { name: SkillName.VIDEO_EDITING, domainId: 7 },
        { name: SkillName.MOTION_GRAPHICS, domainId: 7 },
        { name: SkillName.SOUND_DESIGN, domainId: 7 },
        { name: SkillName.STORYBOARDING, domainId: 7 },
        { name: SkillName.CINEMATOGRAPHY, domainId: 7 },
      ],
    });

    // Users
    const admin = await prisma.user.create({
      data: {
        slug: 'edgar-cresson',
        email: 'edgarcresson@hotmail.com',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10),
        firstName: 'Edgar',
        lastName: 'Cresson',
        profilePicture: base64ToBuffer(edgar),
        skills: {
          connect: [
            { name: SkillName.FRONTEND_DEVELOPMENT },
            { name: SkillName.BACKEND_DEVELOPMENT },
            { name: SkillName.DATA_ENGINEERING },
          ],
        },
        isEmailValidated: true,
      },
    });
    const designer = await prisma.user.create({
      data: {
        slug: 'theo-lefevre',
        email: 'theolefevre@gmail.com',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10),
        firstName: 'Théo',
        lastName: 'Lefèvre',
        profilePicture: base64ToBuffer(theo),
        skills: {
          connect: [
            { name: SkillName.WIREFRAMING },
            { name: SkillName.INTERACTION_DESIGN },
            { name: SkillName.COLOR_THEORY },
          ],
        },
        isEmailValidated: true,
      },
    });
    const user3 = await prisma.user.create({
      data: {
        slug: 'john-doe',
        email: 'john@doe.com',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10),
        firstName: 'John',
        lastName: 'Doe',
        profilePicture: null,
        skills: {
          connect: [
            { name: SkillName.DIGITAL_STRATEGY },
            { name: SkillName.SEO_OPTIMIZATION },
            { name: SkillName.VULNERABILITY_ASSESSMENT },
            { name: SkillName.DATA_ANALYSIS },
            { name: SkillName.MOTION_GRAPHICS },
          ],
        },
        isEmailValidated: true,
      },
    });

    // Projects
    await prisma.project.create({
      data: {
        name: 'Cocreate',
        slug: 'cocreate',
        shortDescription:
          'Application web permettant de mettre en relation les différents acteurs du digital, sur des projets digitaux',
        description:
          "L'objectif principal de Cocreate était de faciliter la mise en relation des personnes partageant les mêmes intérêts et compétences, ou des compétences complémentaires (ex : développeur avec UX/UI designer), afin qu'elles puissent collaborer de manière efficace et épanouissante. L'application devait être un espace virtuel où les utilisateurs pourraient présenter leurs idées de projet et rechercher des partenaires potentiels. Que ce soit pour la création d'une application mobile, le développement d'un site web innovant, ou même la réalisation d'un projet artistique, Cocreate offrait la possibilité de trouver les personnes adéquates pour travailler main dans la main, en étant sur la même longueur d’onde.",
        coverImage: base64ToBuffer(cocreate),
        skills: {
          connect: [
            { name: SkillName.FRONTEND_DEVELOPMENT },
            { name: SkillName.BACKEND_DEVELOPMENT },
            { name: SkillName.DATABASE_MANAGEMENT },
            { name: SkillName.USER_RESEARCH },
            { name: SkillName.WIREFRAMING },
            { name: SkillName.USER_CENTERED_DESIGN },
            { name: SkillName.CONTENT_MARKETING },
            { name: SkillName.SOCIAL_MEDIA_MARKETING },
          ],
        },
        members: {
          create: [
            {
              user: { connect: { id: admin.id } },
              role: Role.OWNER,
            },
          ],
        },
        actions: {
          create: [
            {
              author: { connect: { id: admin.id } },
              name: 'a créé le projet',
            },
            {
              author: { connect: { id: admin.id } },
              name: 'a développé le projet',
            },
          ],
        },
      },
    });

    await prisma.project.create({
      data: {
        name: 'Projet 2',
        slug: 'projet-2',
        shortDescription: 'Description courte du projet 2',
        description: 'Description détaillée du projet 2',
        skills: {
          connect: [
            { name: SkillName.MOTION_GRAPHICS },
            { name: SkillName.TYPOGRAPHY },
          ],
        },
        members: {
          create: [
            {
              user: { connect: { id: user3.id } },
              role: Role.OWNER,
            },
          ],
        },
        actions: {
          create: [
            {
              author: { connect: { id: user3.id } },
              name: 'a créé le projet',
            },
          ],
        },
      },
    });
    await prisma.project.create({
      data: {
        name: 'Projet 3',
        slug: 'projet-3',
        shortDescription: 'Description courte du projet 3',
        description: 'Description détaillée du projet 3',
        skills: {
          connect: [
            { name: SkillName.USER_RESEARCH },
            { name: SkillName.DIGITAL_STRATEGY },
          ],
        },
        members: {
          create: [
            {
              user: { connect: { id: user3.id } },
              role: Role.OWNER,
            },
          ],
        },
        actions: {
          create: [
            {
              author: { connect: { id: user3.id } },
              name: 'a créé le projet',
            },
          ],
        },
      },
    });
    await prisma.project.create({
      data: {
        name: 'Projet 4',
        slug: 'projet-4',
        shortDescription: 'Description courte du projet 4',
        description: 'Description détaillée du projet 4',
        skills: {
          connect: [{ name: SkillName.DATA_ENGINEERING }],
        },
        members: {
          create: [
            {
              user: { connect: { id: user3.id } },
              role: Role.OWNER,
            },
          ],
        },
        actions: {
          create: [
            {
              author: { connect: { id: user3.id } },
              name: 'a créé le projet',
            },
          ],
        },
      },
    });
    await prisma.project.create({
      data: {
        name: 'Projet 5',
        slug: 'projet-5',
        shortDescription: 'Description courte du projet 5',
        description: 'Description détaillée du projet 5',
        skills: {
          connect: [{ name: SkillName.WEB_DEVELOPMENT }],
        },
        members: {
          create: [
            {
              user: { connect: { id: user3.id } },
              role: Role.OWNER,
            },
          ],
        },
        actions: {
          create: [
            {
              author: { connect: { id: user3.id } },
              name: 'a créé le projet',
            },
          ],
        },
      },
    });

    // JoinRequests
    await prisma.joinRequest.create({
      data: {
        userId: designer.id,
        projectId: 1,
      },
    });
    await prisma.joinRequest.create({
      data: {
        userId: user3.id,
        projectId: 1,
      },
    });

    // eslint-disable-next-line no-console
    console.log('Data initialized successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('An error has occurred during data initialization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
