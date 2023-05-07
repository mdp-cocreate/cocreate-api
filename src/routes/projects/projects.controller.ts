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
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  FormattedRetrievedProject,
  ProjectEntity,
} from './entities/project.entity';
import { CreateItemDto } from './dto/create-item-dto';
import { ProjectItemEntity } from './entities/project-item.entity';
import { UserEntityWithoutSensitiveData } from 'src/routes/users/entities/user.entity';
import { AddUserDto } from './dto/add-user-dto';
import { ProjectPreviewEntity } from './entities/project-preview.entity';
import { Role } from '@prisma/client';

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

  @Get('similar-domains')
  findProjectPreviewsThatMatchTheUsersDomains(
    @Query('skip') skip = 0,
    @Query('take') take = 5,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ previews: ProjectPreviewEntity[] }> {
    return this.projectsService.findProjectPreviewsThatMatchTheUsersDomains(
      +skip,
      +take,
      user
    );
  }

  @Get('owned')
  findProjectPreviewsThatTheUserOwns(
    @Query('userId') userId: string | undefined = undefined,
    @Query('skip') skip = 0,
    @Query('take') take = 5,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ previews: ProjectPreviewEntity[] }> {
    return this.projectsService.findProjectPreviewsThatTheUserOwns(
      userId ? +userId : undefined,
      +skip,
      +take,
      user.id
    );
  }

  @Get('member')
  findProjectPreviewsOfWhichTheUserIsAMember(
    @Query('userId') userId: string | undefined = undefined,
    @Query('skip') skip = 0,
    @Query('take') take = 5,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ previews: ProjectPreviewEntity[] }> {
    return this.projectsService.findProjectPreviewsOfWhichTheUserIsAMember(
      userId ? +userId : undefined,
      +skip,
      +take,
      user.id
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{
    project: FormattedRetrievedProject;
    currentUserRole: Role | null;
  }> {
    return this.projectsService.findOne(+id, user.id);
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
