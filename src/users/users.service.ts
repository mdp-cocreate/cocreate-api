import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { Prisma } from '@prisma/client';
import { UserQueryDto } from './dto/user-query-dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll({
    domains = false,
    projects = false,
    contributions = false,
    actions = false,
  }: UserQueryDto): Promise<UserEntity[]> {
    return await this.prisma.users.findMany({
      include: { domains, projects, contributions, actions },
    });
  }

  async findOne(
    email: string,
    {
      domains = false,
      projects = false,
      contributions = false,
      actions = false,
    }: UserQueryDto
  ): Promise<UserEntity> {
    const userFound = await this.prisma.users.findUnique({
      where: { email },
      include: { domains, projects, contributions, actions },
    });

    if (!userFound)
      throw new NotFoundException(`user with email "${email} does not exist"`);
    return userFound;
  }

  async update(
    email: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserEntity> {
    try {
      const userUpdated = await this.prisma.users.update({
        where: { email },
        include: {
          domains: true,
          projects: true,
          contributions: true,
          actions: true,
        },
        data: updateUserDto,
      });
      return userUpdated;
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      )
        throw new NotFoundException();

      throw new InternalServerErrorException();
    }
  }

  async remove(email: string): Promise<UserEntity> {
    try {
      const userToDelete = await this.prisma.users.delete({
        where: { email },
      });
      return userToDelete;
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      )
        throw new NotFoundException();

      throw new InternalServerErrorException();
    }
  }
}
