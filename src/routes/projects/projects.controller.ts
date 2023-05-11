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
import { FormattedRetrievedProject } from './entities/project.entity';
import { CreateItemDto } from './dto/create-item-dto';
import { UserEntityWithoutSensitiveData } from 'src/routes/users/entities/user.entity';
import { AddUserDto } from './dto/add-user-dto';
import { Project, ProjectItem, Role } from '@prisma/client';
import { FormattedRetrievedProjectPreview } from './entities/project-preview.entity';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ project: Project }> {
    return this.projectsService.create(createProjectDto, user.id);
  }

  @Get()
  findAll(): Promise<{ projects: Project[] }> {
    return this.projectsService.findAll();
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

  @Get('similar-domains')
  findProjectPreviewsThatMatchTheUsersDomains(
    @Query('skip') skip = 0,
    @Query('take') take = 5,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ previews: FormattedRetrievedProjectPreview[] }> {
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
  ): Promise<{ previews: FormattedRetrievedProjectPreview[] }> {
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
  ): Promise<{ previews: FormattedRetrievedProjectPreview[] }> {
    return this.projectsService.findProjectPreviewsOfWhichTheUserIsAMember(
      userId ? +userId : undefined,
      +skip,
      +take,
      user.id
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ project: Project }> {
    return this.projectsService.update(+id, updateProjectDto, user.id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ project: Project }> {
    return this.projectsService.remove(+id, user.id);
  }

  @Post(':id/add-user')
  addUser(
    @Param('id') id: string,
    @Body() addUserDto: AddUserDto,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ) {
    return this.projectsService.addUser(+id, addUserDto, user.id);
  }

  @Post(':id/items')
  createItem(
    @Param('id') id: string,
    @Body() createItemDto: CreateItemDto,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ item: ProjectItem }> {
    return this.projectsService.createItem(+id, createItemDto, user.id);
  }
}
