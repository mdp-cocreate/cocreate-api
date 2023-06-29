import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  DomainName,
  Project,
  ProjectItem,
  Role,
  SkillName,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  FormattedRetrievedProject,
  FormattedRetrievedProjectMember,
  RetrievedProject,
} from './entities/project.entity';
import { CreateItemDto } from './dto/create-item-dto';
import { handleError } from 'src/utils/handleError';
import { AddUserDto } from './dto/add-user-dto';
import { UserWithoutSensitiveData } from '../users/entities/user.entity';
import { bufferToImgSrc } from 'src/utils/bufferToImgSrc';
import {
  FormattedRetrievedProjectPreview,
  RetrievedProjectPreview,
} from './entities/project-preview.entity';
import slugify from 'slugify';
import { RetrievedJoinRequest } from './entities/join-request.entity';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProjectDto: CreateProjectDto,
    authorId: number
  ): Promise<{ project: Project }> {
    try {
      const { skills, ...data } = createProjectDto;

      const baseSlug = slugify(createProjectDto.name, {
        lower: true,
      });
      let slug = baseSlug;
      let sequence = 0;

      while (await this.prisma.project.findUnique({ where: { slug } })) {
        slug = `${baseSlug}${sequence ? `-${sequence}` : ''}`;
        sequence++;
      }

      const newProject = await this.prisma.project.create({
        data: {
          ...data,
          slug,
          skills: {
            connect: skills.map((skill) => ({ name: skill })),
          },
          members: {
            create: {
              role: Role.OWNER,
              user: {
                connect: { id: authorId },
              },
            },
          },
          actions: {
            create: {
              author: { connect: { id: authorId } },
              name: 'a créé le projet',
            },
          },
        },
      });

      return { project: newProject };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }

  async getSearchedProjects(
    query: string,
    domains: string,
    skills: string
  ): Promise<{
    projects: FormattedRetrievedProjectPreview[];
  }> {
    const domainsArray = domains ? (domains.split(',') as DomainName[]) : null;
    const skillsArray = skills ? (skills.split(',') as SkillName[]) : null;

    const skillsOrDomainsFilter = skillsArray
      ? {
          some: {
            name: {
              in: skillsArray,
            },
          },
        }
      : domainsArray
      ? {
          some: {
            domain: {
              name: {
                in: domainsArray,
              },
            },
          },
        }
      : undefined;

    const previews: RetrievedProjectPreview[] =
      await this.prisma.project.findMany({
        where: {
          public: true,
          skills: skillsOrDomainsFilter,
          OR: query
            ? [
                { name: { contains: query } },
                { shortDescription: { contains: query } },
                { description: { contains: query } },
              ]
            : undefined,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          createdAt: true,
          coverImage: true,
          members: {
            select: {
              role: true,
              user: {
                select: {
                  id: true,
                  slug: true,
                  profilePicture: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

    const formattedPreviews: FormattedRetrievedProjectPreview[] = previews.map(
      (preview) => {
        return {
          ...preview,
          coverImage: preview.coverImage
            ? bufferToImgSrc(preview.coverImage)
            : null,
          members: preview.members.map((member) => ({
            ...member,
            user: {
              ...member.user,
              profilePicture: member.user.profilePicture
                ? bufferToImgSrc(member.user.profilePicture)
                : null,
            },
          })),
        };
      }
    );

    return { projects: formattedPreviews };
  }

  async getSearchedProjectsCount(
    query: string,
    domains: string,
    skills: string
  ): Promise<{
    count: number;
  }> {
    const domainsArray = domains ? (domains.split(',') as DomainName[]) : null;
    const skillsArray = skills ? (skills.split(',') as SkillName[]) : null;

    const skillsOrDomainsFilter = skillsArray
      ? {
          some: {
            name: {
              in: skillsArray,
            },
          },
        }
      : domainsArray
      ? {
          some: {
            domain: {
              name: {
                in: domainsArray,
              },
            },
          },
        }
      : undefined;

    const count = await this.prisma.project.count({
      where: {
        public: true,
        skills: skillsOrDomainsFilter,
        OR: query
          ? [
              { name: { contains: query } },
              { shortDescription: { contains: query } },
              { description: { contains: query } },
            ]
          : undefined,
      },
    });

    return { count };
  }

  async findAllProjectSlugs(): Promise<{
    slugs: {
      slug: string;
    }[];
  }> {
    const slugs = await this.prisma.project.findMany({
      where: { public: true },
      select: {
        slug: true,
      },
    });

    return { slugs };
  }

  async findProjectPreviewsThatMatchTheUsersDomains(
    skip: number,
    take: number,
    user: UserWithoutSensitiveData
  ): Promise<{ previews: FormattedRetrievedProjectPreview[] }> {
    const userSkillsWithDomains = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        skills: {
          select: {
            domain: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!userSkillsWithDomains?.skills)
      throw new InternalServerErrorException('current user has no domain');

    const userDomains = userSkillsWithDomains.skills.map(
      (skill) => skill.domain.name
    );
    const uniqueUserDomains = [...new Set(userDomains)];

    const previews: RetrievedProjectPreview[] =
      await this.prisma.project.findMany({
        where: {
          public: true,
          skills: {
            some: {
              domain: {
                name: {
                  in: uniqueUserDomains,
                },
              },
            },
          },
          NOT: {
            members: {
              some: {
                userId: {
                  equals: user.id,
                },
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          createdAt: true,
          coverImage: true,
          members: {
            select: {
              role: true,
              user: {
                select: {
                  id: true,
                  slug: true,
                  profilePicture: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        skip,
        take,
      });

    const formattedPreviews: FormattedRetrievedProjectPreview[] = previews.map(
      (preview) => {
        return {
          ...preview,
          coverImage: preview.coverImage
            ? bufferToImgSrc(preview.coverImage)
            : null,
          members: preview.members.map((member) => ({
            ...member,
            user: {
              ...member.user,
              profilePicture: member.user.profilePicture
                ? bufferToImgSrc(member.user.profilePicture)
                : null,
            },
          })),
        };
      }
    );

    return { previews: formattedPreviews };
  }

  async findProjectPreviewsThatTheUserOwns(
    userId: number | undefined,
    skip: number,
    take: number,
    authorId: number
  ): Promise<{ previews: FormattedRetrievedProjectPreview[] }> {
    const previews: { project: RetrievedProjectPreview }[] =
      await this.prisma.projectToMember.findMany({
        where: {
          userId: userId || authorId,
          role: Role.OWNER,
        },
        select: {
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
              shortDescription: true,
              createdAt: true,
              coverImage: true,
              members: {
                select: {
                  role: true,
                  user: {
                    select: {
                      id: true,
                      slug: true,
                      profilePicture: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
        take,
        skip,
      });

    const formattedPreviews: FormattedRetrievedProjectPreview[] = previews
      .map(({ project }) => project)
      .map((preview) => {
        return {
          ...preview,
          coverImage: preview.coverImage
            ? bufferToImgSrc(preview.coverImage)
            : null,
          members: preview.members.map((member) => ({
            ...member,
            user: {
              ...member.user,
              profilePicture: member.user.profilePicture
                ? bufferToImgSrc(member.user.profilePicture)
                : null,
            },
          })),
        };
      });

    return { previews: formattedPreviews };
  }

  async findProjectPreviewsOfWhichTheUserIsAMember(
    userId: number | undefined,
    skip: number,
    take: number,
    authorId: number
  ): Promise<{ previews: FormattedRetrievedProjectPreview[] }> {
    const previews: { project: RetrievedProjectPreview }[] =
      await this.prisma.projectToMember.findMany({
        where: {
          userId: userId || authorId,
          NOT: {
            role: Role.OWNER,
          },
        },
        select: {
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
              shortDescription: true,
              createdAt: true,
              coverImage: true,
              members: {
                select: {
                  role: true,
                  user: {
                    select: {
                      id: true,
                      slug: true,
                      profilePicture: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
        take,
        skip,
      });

    const formattedPreviews: FormattedRetrievedProjectPreview[] = previews
      .map(({ project }) => project)
      .map((preview) => {
        return {
          ...preview,
          coverImage: preview.coverImage
            ? bufferToImgSrc(preview.coverImage)
            : null,
          members: preview.members.map((member) => ({
            ...member,
            user: {
              ...member.user,
              profilePicture: member.user.profilePicture
                ? bufferToImgSrc(member.user.profilePicture)
                : null,
            },
          })),
        };
      });

    return { previews: formattedPreviews };
  }

  async findProjectBySlug(
    slug: string,
    userId: number
  ): Promise<{
    project: FormattedRetrievedProject;
    currentUserRole: Role | null;
  }> {
    const projectFound: RetrievedProject | null =
      await this.prisma.project.findUnique({
        where: { slug },
        include: {
          skills: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
          members: {
            select: {
              role: true,
              user: {
                select: {
                  id: true,
                  slug: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                },
              },
            },
          },
          actions: {
            select: {
              name: true,
              createdAt: true,
              author: {
                select: {
                  slug: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

    if (!projectFound)
      throw new NotFoundException(`project with slug "${slug}" does not exist`);

    if (
      !projectFound.public &&
      !projectFound.members.some((member) => member.user.id === userId)
    ) {
      throw new ForbiddenException('this project is private');
    }

    const formattedProjectMembersFound: FormattedRetrievedProjectMember[] =
      projectFound.members.map((member) => ({
        ...member,
        user: {
          ...member.user,
          profilePicture: member.user.profilePicture
            ? bufferToImgSrc(member.user.profilePicture)
            : null,
        },
      }));

    const formattedProjectFound: FormattedRetrievedProject = {
      ...projectFound,
      coverImage: projectFound.coverImage
        ? bufferToImgSrc(projectFound.coverImage)
        : null,
      members: formattedProjectMembersFound,
    };

    const currentUserRole =
      projectFound.members.find((member) => member.user.id === userId)?.role ||
      null;

    return { project: formattedProjectFound, currentUserRole };
  }

  async findProjectMetadata(slug: string): Promise<{
    metadata: {
      name: string;
      shortDescription: string;
    };
  }> {
    const metadata = await this.prisma.project.findUnique({
      where: { slug },
      select: {
        name: true,
        shortDescription: true,
      },
    });

    if (!metadata)
      throw new NotFoundException(`project with slug "${slug} was not found"`);

    return { metadata };
  }

  async updateMyProject(
    slug: string,
    updateProjectDto: UpdateProjectDto,
    authorId: number
  ): Promise<{ project: Project }> {
    const projectToUpdate = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        members: {
          select: {
            role: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (
      !projectToUpdate?.members.some((member) => member.user.id === authorId)
    ) {
      throw new ForbiddenException(
        'you cannot edit a project you are not member of'
      );
    } else {
      const userRoleForThisProject = projectToUpdate.members.find(
        (member) => member.user.id === authorId
      )?.role;
      const authorizedRoles: Role[] = [Role.OWNER, Role.EDITOR];

      if (!userRoleForThisProject) {
        throw new ForbiddenException();
      }
      if (!authorizedRoles.includes(userRoleForThisProject)) {
        throw new ForbiddenException();
      }
    }

    try {
      const { skills, ...data } = updateProjectDto;

      const projectUpdated = await this.prisma.project.update({
        where: { slug },
        data: {
          ...data,
          skills: skills && {
            set: skills.map((skill) => ({ name: skill })),
          },
          actions: {
            create: {
              author: { connect: { id: authorId } },
              name: `a modifié le projet "${updateProjectDto.name}"`,
            },
          },
        },
      });

      return { project: projectUpdated };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }

  async removeMyProject(
    slug: string,
    authorId: number
  ): Promise<{ project: Project }> {
    const projectToDelete = await this.prisma.project.findUnique({
      where: { slug },
      select: {
        members: {
          where: {
            role: Role.OWNER,
          },
          select: {
            user: {
              select: {
                id: true,
              },
            },
            role: true,
          },
        },
      },
    });

    const ownerOfThisProject = projectToDelete?.members.find(
      (member) => member.role === Role.OWNER
    );

    if (!ownerOfThisProject)
      throw new InternalServerErrorException('this project has no owner');
    if (authorId !== ownerOfThisProject.user.id) throw new ForbiddenException();

    try {
      const projectDeleted = await this.prisma.project.delete({
        where: { slug },
      });

      return { project: projectDeleted };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }

  async askToJoinProject(projectId: number, authorId: number) {
    const projectToJoin = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        members: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!projectToJoin)
      throw new NotFoundException(
        `project with id "${projectId}" does not exist`
      );

    if (projectToJoin.members.some((member) => member.user.id === authorId))
      throw new ConflictException(`you are already a member of this project`);

    try {
      await this.prisma.joinRequest.create({
        data: {
          projectId,
          userId: authorId,
        },
      });
    } catch (error) {
      throw handleError(error);
    }
  }

  async getJoinRequestsByProject(
    projectId: number,
    authorId: number
  ): Promise<{ joinRequests: RetrievedJoinRequest[] }> {
    const projectFound = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        members: {
          select: {
            role: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!projectFound)
      throw new NotFoundException(
        `project with id "${projectId}" does not exist`
      );

    const projectOwner = projectFound.members.find(
      (member) => member.role === Role.OWNER
    );

    if (!projectOwner)
      throw new InternalServerErrorException(`this project has no owner`);

    if (authorId !== projectOwner.user.id)
      throw new ForbiddenException(
        `only the owner of this project can get its join requests`
      );

    try {
      const joinRequests: RetrievedJoinRequest[] =
        await this.prisma.joinRequest.findMany({
          where: {
            projectId,
          },
          select: {
            user: {
              select: {
                slug: true,
                firstName: true,
                lastName: true,
              },
            },
            project: {
              select: {
                slug: true,
                name: true,
              },
            },
            createdAt: true,
          },
        });

      return { joinRequests };
    } catch (error) {
      throw handleError(error);
    }
  }

  async getJoinRequests(
    authorId: number
  ): Promise<{ joinRequests: RetrievedJoinRequest[] }> {
    const projectsThatTheUserOwns = await this.prisma.projectToMember.findMany({
      where: { userId: authorId, role: Role.OWNER },
      select: {
        project: {
          select: {
            id: true,
          },
        },
      },
    });

    const projectIdsThatTheUserOwns = projectsThatTheUserOwns.map(
      (project) => project.project.id
    );

    let allJoinRequests: RetrievedJoinRequest[] = [];

    for (const projectId of projectIdsThatTheUserOwns) {
      const joinRequestsForThisProject = await this.getJoinRequestsByProject(
        projectId,
        authorId
      );

      allJoinRequests = [
        ...allJoinRequests,
        ...joinRequestsForThisProject.joinRequests,
      ];
    }

    return { joinRequests: allJoinRequests };
  }

  async addUser(slug: string, addUserDto: AddUserDto, authorId: number) {
    const projectInWhichToAddTheUser = await this.prisma.project.findUnique({
      where: { slug },
      select: {
        members: {
          where: {
            role: Role.OWNER,
          },
          select: {
            user: {
              select: {
                id: true,
              },
            },
            role: true,
          },
        },
      },
    });

    if (!projectInWhichToAddTheUser) throw new NotFoundException();

    const ownerOfThisProject = projectInWhichToAddTheUser.members.find(
      (member) => member.role === Role.OWNER
    );
    if (!ownerOfThisProject)
      throw new InternalServerErrorException('this project has no owner');

    if (authorId !== ownerOfThisProject.user.id) throw new ForbiddenException();

    try {
      const newRelation = await this.prisma.projectToMember.create({
        data: {
          project: { connect: { slug } },
          user: { connect: { id: addUserDto.id } },
          role: addUserDto.role,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      await this.prisma.project.update({
        where: { slug },
        data: {
          updatedAt: new Date(),
          actions: {
            create: {
              author: { connect: { id: authorId } },
              name: `a ajouté ${newRelation.user.firstName} ${newRelation.user.lastName} au projet`,
            },
          },
        },
      });
    } catch (e: unknown) {
      throw handleError(e);
    }
  }

  async createItem(
    slug: string,
    createItemDto: CreateItemDto,
    authorId: number
  ): Promise<{ item: ProjectItem }> {
    const projectInWhichToAddAnItem = await this.prisma.project.findUnique({
      where: { slug },
      select: {
        public: true,
      },
    });
    if (!projectInWhichToAddAnItem?.public) {
      throw new ForbiddenException('this project is private');
    }

    try {
      const newItem = await this.prisma.projectItem.create({
        data: {
          ...createItemDto,
          author: { connect: { id: authorId } },
          project: { connect: { slug } },
        },
      });
      await this.prisma.project.update({
        where: { slug },
        data: {
          updatedAt: new Date(),
          actions: {
            create: {
              author: { connect: { id: authorId } },
              name: `a ajouté "${createItemDto.name} au projet"`,
            },
          },
        },
      });

      return { item: newItem };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }
}
