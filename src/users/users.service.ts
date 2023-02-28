import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { UserQueryDto } from './dto/user-query-dto';
import { handleError } from 'src/utils/handleError';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll({
    domains = false,
    projects = false,
    contributions = false,
    actions = false,
  }: UserQueryDto): Promise<{ users: UserEntity[] }> {
    const users = await this.prisma.users.findMany({
      include: { domains, projects, contributions, actions },
    });

    return { users };
  }

  async findOne(
    email: string,
    {
      domains = false,
      projects = false,
      contributions = false,
      actions = false,
    }: UserQueryDto
  ): Promise<{ user: UserEntity }> {
    const userFound = await this.prisma.users.findUnique({
      where: { email },
      include: { domains, projects, contributions, actions },
    });

    if (!userFound)
      throw new NotFoundException(`user with email "${email}" does not exist`);

    return { user: userFound };
  }

  async update(
    email: string,
    updateUserDto: UpdateUserDto
  ): Promise<{ user: UserEntity }> {
    const { domains, ...data } = updateUserDto;

    try {
      const userUpdated = await this.prisma.users.update({
        where: { email },
        include: {
          domains: true,
          projects: true,
          contributions: true,
          actions: true,
        },
        data: {
          ...data,
          domains: domains && {
            set: domains.map((domain) => ({ name: domain })),
          },
        },
      });

      return { user: userUpdated };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }

  async remove(email: string): Promise<{ user: UserEntity }> {
    try {
      const userToDelete = await this.prisma.users.delete({
        where: { email },
      });

      return { user: userToDelete };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }
}
