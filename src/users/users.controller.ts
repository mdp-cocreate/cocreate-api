import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UserQueryDto } from './dto/user-query-dto';

@Controller('users')
@UseGuards(AuthGuard())
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() userQueryDto: UserQueryDto): Promise<UserEntity[]> {
    return await this.usersService.findAll(userQueryDto);
  }

  @Get(':email')
  async findOne(
    @Param('email') email: string,
    @Query() userQueryDto: UserQueryDto
  ): Promise<UserEntity> {
    return await this.usersService.findOne(email, userQueryDto);
  }

  @Patch(':email')
  async update(
    @Param('email') email: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserEntity> {
    return await this.usersService.update(email, updateUserDto);
  }

  @Delete(':email')
  async remove(@Param('email') email: string): Promise<UserEntity> {
    return await this.usersService.remove(email);
  }
}
