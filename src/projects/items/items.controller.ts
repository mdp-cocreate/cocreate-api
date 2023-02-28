import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UpdateItemDto } from './dto/update-item-dto';
import { ProjectItemEntity } from '../entities/project-item.entity';
import { ItemsService } from './items.service';
import { DeleteItemDto } from './dto/delete-item-dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('projects/items')
@UseGuards(AuthGuard())
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get(':id')
  findOne(
    @Param('id') id: string
  ): Promise<{ item: Partial<ProjectItemEntity> }> {
    return this.itemsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto
  ): Promise<{ item: ProjectItemEntity }> {
    return this.itemsService.update(+id, updateItemDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Body('authorEmail') deleteItemDto: DeleteItemDto
  ): Promise<{ item: ProjectItemEntity }> {
    return this.itemsService.remove(+id, deleteItemDto);
  }
}
