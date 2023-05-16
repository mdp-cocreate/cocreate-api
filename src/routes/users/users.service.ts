/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  FormattedUserWithoutSensitiveData,
  UserWithoutSensitiveData,
} from './entities/user.entity';
import { handleError } from 'src/utils/handleError';
import { bufferToImgSrc } from 'src/utils/bufferToImgSrc';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<{ users: FormattedUserWithoutSensitiveData[] }> {
    const usersFound = await this.prisma.user.findMany({
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
          ...userWithoutSensitiveData
        } = user;

        return {
          ...userWithoutSensitiveData,
          profilePicture: userWithoutSensitiveData.profilePicture
            ? bufferToImgSrc(userWithoutSensitiveData.profilePicture)
            : null,
        };
      });

    return { users };
  }

  async findUserProfileBySlug(
    slug: string,
    author: UserWithoutSensitiveData
  ): Promise<{
    user: FormattedUserWithoutSensitiveData;
    isItTheUserHimself: boolean;
  }> {
    const isItTheUserHimself = slug === author.slug;
    if (isItTheUserHimself) {
      const formattedAuthor: FormattedUserWithoutSensitiveData = {
        ...author,
        profilePicture: author.profilePicture
          ? bufferToImgSrc(author.profilePicture)
          : null,
      };
      return { user: formattedAuthor, isItTheUserHimself };
    }

    const userFound = await this.prisma.user.findUnique({
      where: { slug },
    });

    if (!userFound || !userFound?.isEmailValidated)
      throw new NotFoundException(`user with slug "${slug}" does not exist`);

    const {
      password,
      resetPasswordToken,
      validateEmailToken,
      isEmailValidated,
      ...formattedUserFound
    } = userFound;

    const formattedUser: FormattedUserWithoutSensitiveData = {
      ...formattedUserFound,
      profilePicture: formattedUserFound.profilePicture
        ? bufferToImgSrc(formattedUserFound.profilePicture)
        : null,
    };

    return { user: formattedUser, isItTheUserHimself };
  }

  async findUserMetadata(slug: string): Promise<{
    metadata: {
      firstName: string;
      lastName: string;
    };
  }> {
    const metadata = await this.prisma.user.findUnique({
      where: { slug },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    if (!metadata)
      throw new NotFoundException(`user with slug "${slug} was not found"`);

    return { metadata };
  }

  async updateMyAccount(
    slug: string,
    updateUserDto: UpdateUserDto,
    authorSlug: string
  ): Promise<{ user: FormattedUserWithoutSensitiveData }> {
    if (slug !== authorSlug) throw new ForbiddenException();

    const { skills, ...data } = updateUserDto;

    const userToUpdate = await this.prisma.user.findUnique({
      where: { slug },
      select: {
        isEmailValidated: true,
      },
    });

    if (!userToUpdate || !userToUpdate.isEmailValidated)
      throw new NotFoundException();

    try {
      const userUpdated = await this.prisma.user.update({
        where: { slug },
        include: {
          skills: true,
        },
        data: {
          ...data,
          skills: skills && {
            set: skills.map((skill) => ({ name: skill })),
          },
        },
      });

      const {
        password,
        resetPasswordToken,
        validateEmailToken,
        isEmailValidated,
        ...userWithoutSensitiveData
      } = userUpdated;

      const formattedUser: FormattedUserWithoutSensitiveData = {
        ...userWithoutSensitiveData,
        profilePicture: userWithoutSensitiveData.profilePicture
          ? bufferToImgSrc(userWithoutSensitiveData.profilePicture)
          : null,
      };

      return { user: formattedUser };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }

  async deleteMyAccount(slug: string, authorSlug: string) {
    if (slug !== authorSlug) throw new ForbiddenException();

    const userToDelete = await this.prisma.user.findUnique({
      where: { slug },
      select: {
        isEmailValidated: true,
      },
    });

    if (!userToDelete || !userToDelete.isEmailValidated)
      throw new NotFoundException();

    try {
      await this.prisma.user.delete({
        where: { slug },
      });
    } catch (e: unknown) {
      throw handleError(e);
    }
  }
}
