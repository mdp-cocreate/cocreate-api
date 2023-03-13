import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleError } from 'src/utils/handleError';
import { ProjectItemEntity } from '../entities/project-item.entity';
import { UpdateItemDto } from './dto/update-item-dto';
import { projectItemRetrieveFormat } from 'src/utils/projectItemRetrieveFormat';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number): Promise<{ item: Partial<ProjectItemEntity> }> {
    const itemFound = await this.prisma.projectItems.findUnique({
      where: { id },
      select: projectItemRetrieveFormat(),
    });

    if (!itemFound)
      throw new NotFoundException(`item with id "${id}" does not exist`);

    return { item: itemFound };
  }

  async update(
    id: number,
    updateItemDto: UpdateItemDto,
    authorEmail: string
  ): Promise<{ item: ProjectItemEntity }> {
    try {
      const itemUpdated = await this.prisma.projectItems.update({
        where: { id },
        data: updateItemDto,
      });
      await this.prisma.projects.update({
        where: { id: itemUpdated.projectId },
        data: {
          updatedAt: new Date(),
          actions: {
            create: {
              author: { connect: { email: authorEmail } },
              name: `a modifié "${itemUpdated.name}"`,
            },
          },
        },
      });

      return { item: itemUpdated };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }

  async remove(
    id: number,
    authorEmail: string
  ): Promise<{ item: ProjectItemEntity }> {
    try {
      const itemToDelete = await this.prisma.projectItems.delete({
        where: { id },
      });
      await this.prisma.projects.update({
        where: { id: itemToDelete.projectId },
        data: {
          updatedAt: new Date(),
          actions: {
            create: {
              author: { connect: { email: authorEmail } },
              name: `a supprimé "${itemToDelete.name}"`,
            },
          },
        },
      });

      return { item: itemToDelete };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }
}
