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
  FormattedUserEntityWithoutSensitiveData,
  UserEntityWithoutSensitiveData,
} from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<{ users: UserEntityWithoutSensitiveData[] }> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async retrieveUserProfileById(
    @Param('id') id: string,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{
    user: FormattedUserEntityWithoutSensitiveData;
    isItTheUserHimself: boolean;
  }> {
    return await this.usersService.retrieveUserProfileById(+id, user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ user: UserEntityWithoutSensitiveData }> {
    return await this.usersService.update(+id, updateUserDto, user.id);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ) {
    return await this.usersService.remove(+id, user.id);
  }
}
