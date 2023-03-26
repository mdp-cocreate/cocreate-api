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
import { UserEntity } from 'src/users/entities/user.entity';
import { AddUserDto } from './dto/add-user-dto';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() { user }: { user: UserEntity }
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
    @Req() { user }: { user: UserEntity }
  ): Promise<{ project: ProjectEntity }> {
    return this.projectsService.findOne(+id, user.email);
  }

  // Seuls les membres du projet en question ayant le rôle OWNER ou EDITOR peuvent modifier le projet
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() { user }: { user: UserEntity }
  ): Promise<{ project: ProjectEntity }> {
    return this.projectsService.update(+id, updateProjectDto, user.email);
  }

  // Seul le membre du projet en question ayant le rôle OWNER peut supprimer le projet
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() { user }: { user: UserEntity }
  ): Promise<{ project: ProjectEntity }> {
    return this.projectsService.remove(+id, user.email);
  }

  // Seul le membre du projet en question ayant le rôle OWNER peut ajouter qqn au projet
  @Post(':id/add-user')
  addUser(
    @Param('id') id: string,
    @Body() addUserDto: AddUserDto,
    @Req() { user }: { user: UserEntity }
  ) {
    return this.projectsService.addUser(+id, addUserDto, user.email);
  }

  // Tous les utilisateurs peuvent contribuer à un projet (si public)
  @Post(':id/items')
  createItem(
    @Param('id') id: string,
    @Body() createItemDto: CreateItemDto,
    @Req() { user }: { user: UserEntity }
  ): Promise<{ item: ProjectItemEntity }> {
    return this.projectsService.createItem(+id, createItemDto, user.email);
  }
}
