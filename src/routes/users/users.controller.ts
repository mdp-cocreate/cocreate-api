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
  FormattedUserWithoutSensitiveData,
  UserWithoutSensitiveData,
} from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<{ users: FormattedUserWithoutSensitiveData[] }> {
    return await this.usersService.findAll();
  }

  @Get(':slug')
  async findUserProfileBySlug(
    @Param('slug') slug: string,
    @Req() { user }: { user: UserWithoutSensitiveData }
  ): Promise<{
    user: FormattedUserWithoutSensitiveData;
    isItTheUserHimself: boolean;
  }> {
    return await this.usersService.findUserProfileBySlug(slug, user);
  }

  @Patch(':slug')
  async updateMyAccount(
    @Param('slug') slug: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() { user }: { user: UserWithoutSensitiveData }
  ): Promise<{ user: FormattedUserWithoutSensitiveData }> {
    return await this.usersService.updateMyAccount(
      slug,
      updateUserDto,
      user.slug
    );
  }

  @Delete(':slug')
  async deleteMyAccount(
    @Param('slug') slug: string,
    @Req() { user }: { user: UserWithoutSensitiveData }
  ) {
    return await this.usersService.deleteMyAccount(slug, user.slug);
  }
}
