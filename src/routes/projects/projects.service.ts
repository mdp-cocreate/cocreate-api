import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity } from './entities/project.entity';
import { CreateItemDto } from './dto/create-item-dto';
import { ProjectItemEntity } from './entities/project-item.entity';
import { handleError } from 'src/utils/handleError';
import { AddUserDto } from './dto/add-user-dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProjectDto: CreateProjectDto,
    authorEmail: string
  ): Promise<{ project: ProjectEntity }> {
    try {
      const { domains, ...data } = createProjectDto;

      const newProject = await this.prisma.projects.create({
        data: {
          ...data,
          domains: {
            connect: domains.map((domain) => ({ name: domain })),
          },
          members: {
            create: {
              role: Role.OWNER,
              user: {
                connect: { email: authorEmail },
              },
            },
          },
          actions: {
            create: {
              author: { connect: { email: authorEmail } },
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

  async findAll(): Promise<{ projects: ProjectEntity[] }> {
    const projects = await this.prisma.projects.findMany({
      where: { public: true },
      include: {
        domains: true,
        members: {
          select: {
            role: true,
            addedAt: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                country: true,
                profilePicture: true,
                registeredAt: true,
              },
            },
          },
        },
        items: {
          select: {
            id: true,
            name: true,
            description: true,
            link: true,
            associatedFile: true,
            author: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
          },
        },
        actions: {
          select: {
            author: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            name: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return { projects };
  }

  async findOne(
    id: number,
    authorEmail: string
  ): Promise<{ project: ProjectEntity }> {
    const projectFound = await this.prisma.projects.findUnique({
      where: { id },
      include: {
        domains: true,
        members: {
          select: {
            role: true,
            addedAt: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                country: true,
                profilePicture: true,
                registeredAt: true,
              },
            },
          },
        },
        items: {
          select: {
            id: true,
            name: true,
            description: true,
            link: true,
            associatedFile: true,
            author: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
          },
        },
        actions: {
          select: {
            author: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            name: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!projectFound)
      throw new NotFoundException(`project with id "${id}" does not exist`);

    if (
      !projectFound.public &&
      !projectFound.members.some((member) => member.user.email === authorEmail)
    ) {
      throw new ForbiddenException('this project is private');
    }

    return { project: projectFound };
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
    authorEmail: string
  ): Promise<{ project: ProjectEntity }> {
    const projectToUpdate = await this.prisma.projects.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            role: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (
      !projectToUpdate?.members.some(
        (member) => member.user.email === authorEmail
      )
    ) {
      throw new ForbiddenException(
        'you cannot edit a project you are not member of'
      );
    } else {
      const userRoleForThisProject = projectToUpdate.members.find(
        (member) => member.user.email === authorEmail
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
      const { domains, ...data } = updateProjectDto;

      const projectUpdated = await this.prisma.projects.update({
        where: { id },
        data: {
          ...data,
          domains: domains && {
            set: domains.map((domain) => ({ name: domain })),
          },
          actions: {
            create: {
              author: { connect: { email: authorEmail } },
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

  async remove(
    id: number,
    authorEmail: string
  ): Promise<{ project: ProjectEntity }> {
    const projectToDelete = await this.prisma.projects.findUnique({
      where: { id },
      select: {
        members: {
          where: {
            role: Role.OWNER,
          },
          select: {
            user: {
              select: {
                email: true,
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
    if (!ownerOfThisProject) {
      throw new InternalServerErrorException('this project has no owner');
    }
    if (authorEmail !== ownerOfThisProject.user.email) {
      throw new ForbiddenException();
    }

    try {
      const projectDeleted = await this.prisma.projects.delete({
        where: { id },
      });

      return { project: projectDeleted };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }

  async addUser(id: number, addUserDto: AddUserDto, authorEmail: string) {
    const projectInWhichToAddTheUser = await this.prisma.projects.findUnique({
      where: { id },
      select: {
        members: {
          where: {
            role: Role.OWNER,
          },
          select: {
            user: {
              select: {
                email: true,
              },
            },
            role: true,
          },
        },
      },
    });

    const ownerOfThisProject = projectInWhichToAddTheUser?.members.find(
      (member) => member.role === Role.OWNER
    );
    if (!ownerOfThisProject) {
      throw new InternalServerErrorException('this project has no owner');
    }
    if (authorEmail !== ownerOfThisProject.user.email) {
      throw new ForbiddenException();
    }

    try {
      const newRelation = await this.prisma.projectsToMembers.create({
        data: {
          project: { connect: { id } },
          user: { connect: { email: addUserDto.email } },
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

      await this.prisma.projects.update({
        where: { id },
        data: {
          updatedAt: new Date(),
          actions: {
            create: {
              author: { connect: { email: authorEmail } },
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
    id: number,
    createItemDto: CreateItemDto,
    authorEmail: string
  ): Promise<{ item: ProjectItemEntity }> {
    const projectInWhichToAddAnItem = await this.prisma.projects.findUnique({
      where: { id },
      select: {
        public: true,
      },
    });
    if (!projectInWhichToAddAnItem?.public) {
      throw new ForbiddenException('this project is private');
    }

    try {
      const newItem = await this.prisma.projectItems.create({
        data: {
          ...createItemDto,
          author: { connect: { email: authorEmail } },
          project: { connect: { id } },
        },
      });
      await this.prisma.projects.update({
        where: { id },
        data: {
          updatedAt: new Date(),
          actions: {
            create: {
              author: { connect: { email: authorEmail } },
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
