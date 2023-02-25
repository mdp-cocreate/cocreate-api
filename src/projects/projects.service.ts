import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateItemDto } from './dto/create-item-dto';
import { ProjectFiltersDto } from './dto/project-filters-dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectItemEntity } from './entities/project-item.entity';
import { ProjectEntity } from './entities/project.entity';
import { UpdateItemDto } from './dto/update-item-dto';

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

  // Items
  async createItem(
    id: number,
    createItemDto: CreateItemDto
  ): Promise<ProjectItemEntity> {
    try {
      return await this.prisma.projectItems.create({
        data: { ...createItemDto, projectId: id },
      });
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      )
        throw new ConflictException();

      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      )
        throw new NotFoundException(e.meta?.cause);

      throw new InternalServerErrorException();
    }
  }

  async findAllItems(id: number): Promise<{ items: ProjectItemEntity[] }> {
    const items = await this.prisma.projectItems.findMany({
      where: {
        projectId: id,
      },
      include: {
        author: true,
      },
    });

    return { items };
  }

  async findOneItem(id: number): Promise<{ item: ProjectItemEntity }> {
    const itemFound = await this.prisma.projectItems.findUnique({
      where: {
        id,
      },
    });

    if (!itemFound)
      throw new NotFoundException(`item with id "${id}" does not exist`);

    return { item: itemFound };
  }

  async updateItem(
    id: number,
    updateItemDto: UpdateItemDto
  ): Promise<{ item: ProjectItemEntity }> {
    try {
      const itemUpdated = await this.prisma.projectItems.update({
        where: { id },
        data: updateItemDto,
      });
      return { item: itemUpdated };
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      )
        throw new NotFoundException(e.meta?.cause);

      throw new InternalServerErrorException();
    }
  }

  async removeItem(id: number): Promise<{ item: ProjectItemEntity }> {
    try {
      const itemToDelete = await this.prisma.projectItems.delete({
        where: { id },
      });
      return { item: itemToDelete };
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
