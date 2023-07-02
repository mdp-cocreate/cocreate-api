/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  FormattedRetrievedUserProfile,
  FormattedUserWithoutSensitiveData,
  RetrievedUserProfile,
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

  async getCurrentUserProfile(userId: number): Promise<{
    user: FormattedRetrievedUserProfile;
  }> {
    const userFound: RetrievedUserProfile | null =
      await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          slug: true,
          email: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          registeredAt: true,
          skills: {
            include: {
              domain: true,
            },
          },
          actions: true,
          isEmailValidated: true,
        },
      });

    if (!userFound || !userFound.isEmailValidated)
      throw new NotFoundException(`user with id "${userId}" does not exist`);

    const formattedUser: FormattedRetrievedUserProfile = {
      ...userFound,
      profilePicture: userFound.profilePicture
        ? bufferToImgSrc(userFound.profilePicture)
        : null,
    };

    return { user: formattedUser };
  }

  async findUserProfileBySlug(
    slug: string,
    author: UserWithoutSensitiveData
  ): Promise<{
    user: FormattedRetrievedUserProfile;
    isItTheUserHimself: boolean;
  }> {
    const isItTheUserHimself = slug === author.slug;

    const userFound: RetrievedUserProfile | null =
      await this.prisma.user.findUnique({
        where: { slug },
        select: {
          id: true,
          slug: true,
          email: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          registeredAt: true,
          skills: {
            include: {
              domain: true,
            },
          },
          actions: true,
          isEmailValidated: true,
        },
      });

    if (!userFound || !userFound.isEmailValidated)
      throw new NotFoundException(`user with slug "${slug}" does not exist`);

    const formattedUser: FormattedRetrievedUserProfile = {
      ...userFound,
      profilePicture: userFound.profilePicture
        ? bufferToImgSrc(userFound.profilePicture)
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
    updateUserDto: UpdateUserDto,
    authorSlug: string
  ): Promise<{ user: FormattedUserWithoutSensitiveData }> {
    const { skills, ...data } = updateUserDto;

    const userToUpdate = await this.prisma.user.findUnique({
      where: { slug: authorSlug },
      select: {
        isEmailValidated: true,
      },
    });

    if (!userToUpdate || !userToUpdate.isEmailValidated)
      throw new NotFoundException();

    try {
      const userUpdated = await this.prisma.user.update({
        where: { slug: authorSlug },
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

  async deleteMyAccount(authorSlug: string) {
    const userToDelete = await this.prisma.user.findUnique({
      where: { slug: authorSlug },
      select: {
        isEmailValidated: true,
      },
    });

    if (!userToDelete || !userToDelete.isEmailValidated)
      throw new NotFoundException();

    try {
      await this.prisma.user.delete({
        where: { slug: authorSlug },
      });
    } catch (e: unknown) {
      throw handleError(e);
    }
  }
}
