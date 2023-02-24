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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity } from './entities/project.entity';
import { ProjectFiltersDto } from './dto/project-filters-dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('projects')
@UseGuards(AuthGuard())
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto): Promise<ProjectEntity> {
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
}
