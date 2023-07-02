import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleError } from 'src/utils/handleError';
import { UpdateItemDto } from './dto/update-item-dto';
import { ProjectItem } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number): Promise<{ item: Partial<ProjectItem> }> {
    const itemFound = await this.prisma.projectItem.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        shortDescription: true,
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
    });

    if (!itemFound)
      throw new NotFoundException(`item with id "${id}" does not exist`);

    return { item: itemFound };
  }

  async update(
    id: number,
    updateItemDto: UpdateItemDto,
    authorEmail: string
  ): Promise<{ item: ProjectItem }> {
    try {
      const itemUpdated = await this.prisma.projectItem.update({
        where: { id },
        data: updateItemDto,
      });
      await this.prisma.project.update({
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
  ): Promise<{ item: ProjectItem }> {
    try {
      const itemToDelete = await this.prisma.projectItem.delete({
        where: { id },
      });
      await this.prisma.project.update({
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
