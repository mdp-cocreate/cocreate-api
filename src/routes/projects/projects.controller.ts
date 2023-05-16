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
import { UserWithoutSensitiveData } from 'src/routes/users/entities/user.entity';
import { AddUserDto } from './dto/add-user-dto';
import { Project, ProjectItem, Role } from '@prisma/client';
import { FormattedRetrievedProjectPreview } from './entities/project-preview.entity';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() { user }: { user: UserWithoutSensitiveData }
  ): Promise<{ project: Project }> {
    return this.projectsService.create(createProjectDto, user.id);
  }

  @Get()
  findAllProjectSlugs(): Promise<{
    slugs: {
      slug: string;
    }[];
  }> {
    return this.projectsService.findAllProjectSlugs();
  }

  @Get('similar-domains')
  @UseGuards(AuthGuard('jwt'))
  findProjectPreviewsThatMatchTheUsersDomains(
    @Query('skip') skip = 0,
    @Query('take') take = 5,
    @Req() { user }: { user: UserWithoutSensitiveData }
  ): Promise<{ previews: FormattedRetrievedProjectPreview[] }> {
    return this.projectsService.findProjectPreviewsThatMatchTheUsersDomains(
      +skip,
      +take,
      user
    );
  }

  @Get('owned')
  @UseGuards(AuthGuard('jwt'))
  findProjectPreviewsThatTheUserOwns(
    @Query('userId') userId: string | undefined = undefined,
    @Query('skip') skip = 0,
    @Query('take') take = 5,
    @Req() { user }: { user: UserWithoutSensitiveData }
  ): Promise<{ previews: FormattedRetrievedProjectPreview[] }> {
    return this.projectsService.findProjectPreviewsThatTheUserOwns(
      userId ? +userId : undefined,
      +skip,
      +take,
      user.id
    );
  }

  @Get('member')
  @UseGuards(AuthGuard('jwt'))
  findProjectPreviewsOfWhichTheUserIsAMember(
    @Query('userId') userId: string | undefined = undefined,
    @Query('skip') skip = 0,
    @Query('take') take = 5,
    @Req() { user }: { user: UserWithoutSensitiveData }
  ): Promise<{ previews: FormattedRetrievedProjectPreview[] }> {
    return this.projectsService.findProjectPreviewsOfWhichTheUserIsAMember(
      userId ? +userId : undefined,
      +skip,
      +take,
      user.id
    );
  }

  @Get(':slug')
  @UseGuards(AuthGuard('jwt'))
  findProjectBySlug(
    @Param('slug') slug: string,
    @Req() { user }: { user: UserWithoutSensitiveData }
  ): Promise<{
    project: FormattedRetrievedProject;
    currentUserRole: Role | null;
  }> {
    return this.projectsService.findProjectBySlug(slug, user.id);
  }

  @Get(':slug/metadata')
  findProjectMetadata(@Param('slug') slug: string): Promise<{
    metadata: {
      name: string;
      shortDescription: string;
    };
  }> {
    return this.projectsService.findProjectMetadata(slug);
  }

  @Patch(':slug')
  @UseGuards(AuthGuard('jwt'))
  updateMyProject(
    @Param('slug') slug: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() { user }: { user: UserWithoutSensitiveData }
  ): Promise<{ project: Project }> {
    return this.projectsService.updateMyProject(
      slug,
      updateProjectDto,
      user.id
    );
  }

  @Delete(':slug')
  @UseGuards(AuthGuard('jwt'))
  deleteMyProject(
    @Param('slug') slug: string,
    @Req() { user }: { user: UserWithoutSensitiveData }
  ): Promise<{ project: Project }> {
    return this.projectsService.removeMyProject(slug, user.id);
  }

  @Post(':slug/add-user')
  @UseGuards(AuthGuard('jwt'))
  addUser(
    @Param('slug') slug: string,
    @Body() addUserDto: AddUserDto,
    @Req() { user }: { user: UserWithoutSensitiveData }
  ) {
    return this.projectsService.addUser(slug, addUserDto, user.id);
  }

  @Post(':slug/items')
  @UseGuards(AuthGuard('jwt'))
  createItem(
    @Param('slug') slug: string,
    @Body() createItemDto: CreateItemDto,
    @Req() { user }: { user: UserWithoutSensitiveData }
  ): Promise<{ item: ProjectItem }> {
    return this.projectsService.createItem(slug, createItemDto, user.id);
  }
}
