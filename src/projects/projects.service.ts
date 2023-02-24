import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectFiltersDto } from './dto/project-filters-dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto): Promise<ProjectEntity> {
    try {
      return await this.prisma.projects.create({
        data: createProjectDto,
      });
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      )
        throw new ConflictException();

      throw new InternalServerErrorException();
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
      const projectUpdated = await this.prisma.projects.update({
        where: { id },
        data: updateProjectDto,
      });
      return { project: projectUpdated };
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      )
        throw new NotFoundException(e.meta?.cause);

      throw new InternalServerErrorException();
    }
  }

  async remove(id: number): Promise<{ project: ProjectEntity }> {
    try {
      const projectToDelete = await this.prisma.projects.delete({
        where: { id },
      });
      return { project: projectToDelete };
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      )
        throw new NotFoundException(e.meta?.cause);

      throw new InternalServerErrorException();
    }
  }
}
