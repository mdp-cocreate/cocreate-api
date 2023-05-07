/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  FormattedUserEntityWithoutSensitiveData,
  UserEntityWithoutSensitiveData,
} from './entities/user.entity';
import { handleError } from 'src/utils/handleError';
import { bufferToImgSrc } from 'src/utils/bufferToImgSrc';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<{ users: UserEntityWithoutSensitiveData[] }> {
    const usersFound = await this.prisma.users.findMany({
      where: {
        isEmailValidated: true,
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

  async retrieveUserProfileById(
    userId: number,
    author: UserEntityWithoutSensitiveData
  ): Promise<{
    user: FormattedUserEntityWithoutSensitiveData;
    isItTheUserHimself: boolean;
  }> {
    const isItTheUserHimself = userId === author.id;
    if (isItTheUserHimself) {
      const formattedAuthor: FormattedUserEntityWithoutSensitiveData = {
        ...author,
        profilePicture: author.profilePicture
          ? bufferToImgSrc(author.profilePicture)
          : null,
      };
      return { user: formattedAuthor, isItTheUserHimself };
    }

    const userFound = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!userFound || !userFound?.isEmailValidated)
      throw new NotFoundException(`user with id "${userId}" does not exist`);

    const {
      password,
      resetPasswordToken,
      validateEmailToken,
      isEmailValidated,
      ...formattedUserFound
    } = userFound;

    const formattedUser: FormattedUserEntityWithoutSensitiveData = {
      ...formattedUserFound,
      profilePicture: formattedUserFound.profilePicture
        ? bufferToImgSrc(formattedUserFound.profilePicture)
        : null,
    };

    return { user: formattedUser, isItTheUserHimself };
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    authorId: number
  ): Promise<{ user: UserEntityWithoutSensitiveData }> {
    const { domains, ...data } = updateUserDto;

    const userToUpdate = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        isEmailValidated: true,
      },
    });

    if (!userToUpdate || !userToUpdate.isEmailValidated)
      throw new NotFoundException();

    if (userToUpdate.id !== authorId) throw new ForbiddenException();

    try {
      const userUpdated = await this.prisma.users.update({
        where: { id },
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

  async remove(id: number, authorId: number) {
    const userToDelete = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        isEmailValidated: true,
      },
    });

    if (!userToDelete || !userToDelete.isEmailValidated)
      throw new NotFoundException();

    if (userToDelete.id !== authorId) throw new ForbiddenException();

    try {
      await this.prisma.users.delete({
        where: { id },
      });
    } catch (e: unknown) {
      throw handleError(e);
    }
  }
}
