/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntityWithoutSensitiveData } from './entities/user.entity';
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
  }: UserQueryDto): Promise<{ users: UserEntityWithoutSensitiveData[] }> {
    const usersFound = await this.prisma.users.findMany({
      where: {
        isEmailValidated: true,
      },
      include: {
        domains,
        projects,
        contributions,
        actions,
      },
    });

    const users = usersFound
      .filter((userFound) => userFound.isEmailValidated)
      .map((user) => {
        const {
          password,
          resetPasswordToken,
          validateEmailToken,
          isEmailValidated,
          ...formattedUser
        } = user;
        return formattedUser;
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
  ): Promise<{ user: UserEntityWithoutSensitiveData }> {
    const userFound = await this.prisma.users.findUnique({
      where: { email },
      include: { domains, projects, contributions, actions },
    });

    if (!userFound || !userFound?.isEmailValidated)
      throw new NotFoundException(`user with email "${email}" does not exist`);

    const {
      password,
      resetPasswordToken,
      validateEmailToken,
      isEmailValidated,
      ...formattedUser
    } = userFound;

    return { user: formattedUser };
  }

  async update(
    email: string,
    updateUserDto: UpdateUserDto,
    authorEmail: string
  ): Promise<{ user: UserEntityWithoutSensitiveData }> {
    const { domains, ...data } = updateUserDto;

    const userToUpdate = await this.prisma.users.findUnique({
      where: { email },
      select: {
        email: true,
        isEmailValidated: true,
      },
    });

    if (!userToUpdate || !userToUpdate.isEmailValidated)
      throw new NotFoundException();

    if (userToUpdate.email !== authorEmail) throw new ForbiddenException();

    try {
      const userUpdated = await this.prisma.users.update({
        where: { email },
        include: {
          domains: true,
          // projects: true,
          // contributions: true,
          // actions: true,
        },
        data: {
          ...data,
          domains: domains && {
            set: domains.map((domain) => ({ name: domain })),
          },
        },
      });

      const {
        password,
        resetPasswordToken,
        validateEmailToken,
        isEmailValidated,
        ...formattedUser
      } = userUpdated;

      return { user: formattedUser };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }

  async remove(email: string, authorEmail: string) {
    const userToDelete = await this.prisma.users.findUnique({
      where: { email },
      select: {
        email: true,
        isEmailValidated: true,
      },
    });

    if (!userToDelete || !userToDelete.isEmailValidated)
      throw new NotFoundException();

    if (userToDelete.email !== authorEmail) throw new ForbiddenException();

    try {
      await this.prisma.users.delete({
        where: { email },
      });
    } catch (e: unknown) {
      throw handleError(e);
    }
  }
}
