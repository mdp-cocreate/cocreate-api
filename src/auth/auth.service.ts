import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { Prisma } from '@prisma/client';
import { UserEntity } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async signup(signupDto: SignupDto): Promise<UserEntity> {
    const salt = await bcrypt.genSalt(Number(process.env.HASH_SALT) || 10);
    const hash = await bcrypt.hash(signupDto.password, salt);
    const newUser = { ...signupDto, password: hash };
    try {
      return await this.prisma.users.create({ data: newUser });
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      )
        throw new ConflictException(
          `the email ${newUser.email} is already taken`
        );

      throw new InternalServerErrorException();
    }
  }

  async login({ email, password }: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException();

    const payload: JwtPayload = { email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
