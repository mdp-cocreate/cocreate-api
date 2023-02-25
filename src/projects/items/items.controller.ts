import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { UpdateItemDto } from './dto/update-item-dto';
import { ProjectItemEntity } from '../entities/project-item.entity';
import { ItemsService } from './items.service';

@Controller('projects/items')
// @UseGuards(AuthGuard())
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get(':id')
  findOneItem(@Param('id') id: string): Promise<{ item: ProjectItemEntity }> {
    return this.itemsService.findOneItem(+id);
  }

  @Patch(':id')
  updateItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto
  ): Promise<{ item: ProjectItemEntity }> {
    return this.itemsService.updateItem(+id, updateItemDto);
  }

  @Delete(':id')
  removeItem(@Param('id') id: string): Promise<{ item: ProjectItemEntity }> {
    return this.itemsService.removeItem(+id);
  }
}
