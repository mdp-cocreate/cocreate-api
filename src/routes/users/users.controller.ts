import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  FormattedRetrievedUserProfile,
  FormattedUserWithoutSensitiveData,
  UserWithoutSensitiveData,
} from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(): Promise<{ users: FormattedUserWithoutSensitiveData[] }> {
    return await this.usersService.findAll();
  }

  @Get('current')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUserProfile(
    @Req() { user }: { user: UserWithoutSensitiveData }
  ): Promise<{
    user: FormattedRetrievedUserProfile;
  }> {
    return await this.usersService.getCurrentUserProfile(+user.id);
  }

  @Get(':slug')
  @UseGuards(AuthGuard('jwt'))
  async findUserProfileBySlug(
    @Param('slug') slug: string,
    @Req() { user }: { user: UserWithoutSensitiveData }
  ): Promise<{
    user: FormattedRetrievedUserProfile;
    isItTheUserHimself: boolean;
  }> {
    return await this.usersService.findUserProfileBySlug(slug, user);
  }

  @Get(':slug/metadata')
  findUserMetadata(@Param('slug') slug: string): Promise<{
    metadata: {
      firstName: string;
      lastName: string;
    };
  }> {
    return this.usersService.findUserMetadata(slug);
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  async updateMyAccount(
    @Body() updateUserDto: UpdateUserDto,
    @Req() { user }: { user: UserWithoutSensitiveData }
  ): Promise<{ user: FormattedUserWithoutSensitiveData }> {
    return await this.usersService.updateMyAccount(updateUserDto, user.slug);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard('jwt'))
  async deleteMyAccount(@Req() { user }: { user: UserWithoutSensitiveData }) {
    return await this.usersService.deleteMyAccount(user.slug);
  }
}
