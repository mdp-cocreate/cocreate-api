import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity } from './entities/project.entity';
import { CreateItemDto } from './dto/create-item-dto';
import { ProjectItemEntity } from './entities/project-item.entity';
import { UserEntityWithoutSensitiveData } from 'src/routes/users/entities/user.entity';
import { AddUserDto } from './dto/add-user-dto';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ project: ProjectEntity }> {
    return this.projectsService.create(createProjectDto, user.email);
  }

  @Get()
  findAll(): Promise<{ projects: ProjectEntity[] }> {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ project: ProjectEntity }> {
    return this.projectsService.findOne(+id, user.email);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ project: ProjectEntity }> {
    return this.projectsService.update(+id, updateProjectDto, user.email);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ project: ProjectEntity }> {
    return this.projectsService.remove(+id, user.email);
  }

  @Post(':id/add-user')
  addUser(
    @Param('id') id: string,
    @Body() addUserDto: AddUserDto,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ) {
    return this.projectsService.addUser(+id, addUserDto, user.email);
  }

  @Post(':id/items')
  createItem(
    @Param('id') id: string,
    @Body() createItemDto: CreateItemDto,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ item: ProjectItemEntity }> {
    return this.projectsService.createItem(+id, createItemDto, user.email);
  }
}
