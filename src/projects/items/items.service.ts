import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleError } from 'src/utils/handleError';
import { DeleteItemDto } from './dto/delete-item-dto';
import { ProjectItemEntity } from '../entities/project-item.entity';
import { UpdateItemDto } from './dto/update-item-dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number): Promise<{ item: ProjectItemEntity }> {
    const itemFound = await this.prisma.projectItems.findUnique({
      where: { id },
    });

    if (!itemFound)
      throw new NotFoundException(`item with id "${id}" does not exist`);

    return { item: itemFound };
  }

  async update(
    id: number,
    updateItemDto: UpdateItemDto
  ): Promise<{ item: ProjectItemEntity }> {
    try {
      const { authorEmail, ...data } = updateItemDto;

      const itemUpdated = await this.prisma.projectItems.update({
        where: { id },
        data,
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
    { authorEmail }: DeleteItemDto
  ): Promise<{ item: ProjectItemEntity }> {
    try {
      const itemToDelete = await this.prisma.projectItems.delete({
        where: { id },
      });
      await this.prisma.actions.create({
        data: {
          project: { connect: { id: itemToDelete.projectId } },
          author: { connect: { email: authorEmail } },
          name: `a supprimé "${itemToDelete.name}"`,
        },
      });

      return { item: itemToDelete };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }
}
