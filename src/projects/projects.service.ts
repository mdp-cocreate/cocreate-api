import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectFiltersDto } from './dto/project-filters-dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity } from './entities/project.entity';
import { CreateItemDto } from './dto/create-item-dto';
import { ProjectItemEntity } from './entities/project-item.entity';
import { handleError } from 'src/utils/handleError';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProjectDto: CreateProjectDto
  ): Promise<{ project: ProjectEntity }> {
    try {
      const { authorEmail, domains, ...data } = createProjectDto;

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

  async findAll({
    selectDomains,
    selectMembers,
    selectItems,
    selectActions,
  }: ProjectFiltersDto): Promise<{ projects: ProjectEntity[] }> {
    const projects = await this.prisma.projects.findMany({
      include: {
        domains: selectDomains,
        members: selectMembers && {
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
        items: selectItems && {
          select: {
            id: true,
            name: true,
            description: true,
            link: true,
            associatedFile: true,
          },
        },
        actions: selectActions && {
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
        },
      },
    });

    return { projects };
  }

  async findOne(
    id: number,
    {
      selectDomains,
      selectMembers,
      selectItems,
      selectActions,
    }: ProjectFiltersDto
  ): Promise<{ project: ProjectEntity }> {
    const projectFound = await this.prisma.projects.findUnique({
      where: { id },
      include: {
        domains: selectDomains,
        members: selectMembers && {
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
        items: selectItems && {
          select: {
            id: true,
            name: true,
            description: true,
            link: true,
            associatedFile: true,
          },
        },
        actions: selectActions && {
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
        },
      },
    });

    if (!projectFound)
      throw new NotFoundException(`project with id "${id}" does not exist`);

    return { project: projectFound };
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto
  ): Promise<{ project: ProjectEntity }> {
    try {
      const { authorEmail, domains, ...data } = updateProjectDto;

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

  async remove(id: number): Promise<{ project: ProjectEntity }> {
    try {
      const projectToDelete = await this.prisma.projects.delete({
        where: { id },
      });
      return { project: projectToDelete };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }

  async createItem(
    id: number,
    createItemDto: CreateItemDto
  ): Promise<{ item: ProjectItemEntity }> {
    try {
      const { authorEmail, ...data } = createItemDto;

      const newItem = await this.prisma.projectItems.create({
        data: {
          ...data,
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
              name: `a créé "${createItemDto.name}"`,
            },
          },
        },
      });

      return { item: newItem };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }

  async findAllItems(id: number): Promise<{ items: ProjectItemEntity[] }> {
    const items = await this.prisma.projectItems.findMany({
      where: { projectId: id },
      include: { author: true },
    });

    return { items };
  }
}
