import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard())
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<UserEntity[]> {
    return await this.usersService.findAll();
  }

  @Get(':email')
  async findOne(@Param('email') email: string): Promise<UserEntity> {
    return await this.usersService.findOne(email);
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
