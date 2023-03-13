import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UpdateItemDto } from './dto/update-item-dto';
import { ProjectItemEntity } from '../entities/project-item.entity';
import { ItemsService } from './items.service';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from 'src/users/entities/user.entity';

@Controller('projects/items')
@UseGuards(AuthGuard('jwt'))
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
    @Body() updateItemDto: UpdateItemDto,
    @Req() { user }: { user: UserEntity }
  ): Promise<{ item: ProjectItemEntity }> {
    return this.itemsService.update(+id, updateItemDto, user.email);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() { user }: { user: UserEntity }
  ): Promise<{ item: ProjectItemEntity }> {
    return this.itemsService.remove(+id, user.email);
  }
}
