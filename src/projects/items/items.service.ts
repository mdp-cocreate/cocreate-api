import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectItemEntity } from '../entities/project-item.entity';
import { UpdateItemDto } from './dto/update-item-dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

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
