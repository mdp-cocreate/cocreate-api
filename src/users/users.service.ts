import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const salt = await bcrypt.genSalt(Number(process.env.PASSWORD_SALT) || 10);
    const hash = await bcrypt.hash(createUserDto.password, salt);
    const newUser = { ...createUserDto, password: hash };
    return await this.prisma.users.create({ data: newUser });
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.prisma.users.findMany({
      include: {
        domains: true,
      },
    });
  }

  async findOne(email: string): Promise<UserEntity> {
    const userFound = await this.prisma.users.findUnique({
      where: { email },
      include: {
        domains: true,
      },
    });

    if (!userFound) throw new NotFoundException();
    return userFound;
  }

  async update(
    email: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserEntity> {
    try {
      const userUpdated = await this.prisma.users.update({
        where: { email },
        data: updateUserDto,
      });
      return userUpdated;
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async remove(email: string): Promise<UserEntity> {
    try {
      const userToDelete = await this.prisma.users.delete({ where: { email } });
      return userToDelete;
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
