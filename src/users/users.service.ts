import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
        data: updateUserDto,
      });
      return userUpdated;
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      )
        throw new NotFoundException(
          `the email address "${email}" is not associated with any account`
        );

      throw new InternalServerErrorException();
    }
  }

  async remove(email: string): Promise<UserEntity> {
    try {
      const userToDelete = await this.prisma.users.delete({ where: { email } });
      return userToDelete;
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      )
        throw new NotFoundException(
          `the email address "${email}" is not associated with any account`
        );

      throw new InternalServerErrorException();
    }
  }
}
