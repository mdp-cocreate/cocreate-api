import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity } from './entities/project.entity';
import { ProjectFiltersDto } from './dto/project-filters-dto';
import { CreateItemDto } from './dto/create-item-dto';
import { ProjectItemEntity } from './entities/project-item.entity';

@Controller('projects')
// @UseGuards(AuthGuard())
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto
  ): Promise<{ project: ProjectEntity }> {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll(
    @Body() projectFiltersDto: ProjectFiltersDto
  ): Promise<{ projects: ProjectEntity[] }> {
    return this.projectsService.findAll(projectFiltersDto);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Body() projectFiltersDto: ProjectFiltersDto
  ): Promise<{ project: ProjectEntity }> {
    return this.projectsService.findOne(+id, projectFiltersDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<{ project: ProjectEntity }> {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ project: ProjectEntity }> {
    return this.projectsService.remove(+id);
  }

  @Post(':id/items')
  createItem(
    @Param('id') id: string,
    @Body() createItemDto: CreateItemDto
  ): Promise<{ item: ProjectItemEntity }> {
    return this.projectsService.createItem(+id, createItemDto);
  }

  @Get(':id/items')
  findAllItems(
    @Param('id') id: string
  ): Promise<{ items: ProjectItemEntity[] }> {
    return this.projectsService.findAllItems(+id);
  }
}
