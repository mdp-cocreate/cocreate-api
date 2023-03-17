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
import { projectRetrievalFormat } from 'src/utils/projectRetrievalFormat';

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

  async findAll(
    projectFiltersDto: ProjectFiltersDto
  ): Promise<{ projects: ProjectEntity[] }> {
    const projects = await this.prisma.projects.findMany({
      where: { public: true },
      include: projectRetrievalFormat(projectFiltersDto),
    });

    return { projects };
  }

  async findOne(
    id: number,
    projectFiltersDto: ProjectFiltersDto
  ): Promise<{ project: ProjectEntity }> {
    const projectFound = await this.prisma.projects.findUnique({
      where: { id },
      include: projectRetrievalFormat(projectFiltersDto),
    });

    if (!projectFound)
      throw new NotFoundException(`project with id "${id}" does not exist`);

    return { project: projectFound };
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
    authorEmail: string
  ): Promise<{ project: ProjectEntity }> {
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
    createItemDto: CreateItemDto,
    authorEmail: string
  ): Promise<{ item: ProjectItemEntity }> {
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
