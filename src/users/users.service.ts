import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(createUserDto.password, salt);
    const newUser = { ...createUserDto, password: hash };
    return this.prisma.users.create({ data: newUser });
  }

  findAll() {
    return this.prisma.users.findMany({
      include: {
        domains: true,
      },
    });
  }

  findOne(email: string) {
    return this.prisma.users.findUnique({ where: { email } });
  }

  update(email: string, updateUserDto: UpdateUserDto) {
    return this.prisma.users.update({
      where: { email },
      data: updateUserDto,
    });
  }

  remove(email: string) {
    return this.prisma.users.delete({ where: { email } });
  }
}
