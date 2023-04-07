import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntityWithoutSensitiveData } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UserQueryDto } from './dto/user-query-dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query() userQueryDto: UserQueryDto
  ): Promise<{ users: UserEntityWithoutSensitiveData[] }> {
    return await this.usersService.findAll(userQueryDto);
  }

  @Get(':email')
  async findOne(
    @Param('email') email: string,
    @Query() userQueryDto: UserQueryDto
  ): Promise<{ user: UserEntityWithoutSensitiveData }> {
    return await this.usersService.findOne(email, userQueryDto);
  }

  @Patch(':email')
  async update(
    @Param('email') email: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ): Promise<{ user: UserEntityWithoutSensitiveData }> {
    return await this.usersService.update(email, updateUserDto, user.email);
  }

  @Delete(':email')
  async remove(
    @Param('email') email: string,
    @Req() { user }: { user: UserEntityWithoutSensitiveData }
  ) {
    return await this.usersService.remove(email, user.email);
  }
}
