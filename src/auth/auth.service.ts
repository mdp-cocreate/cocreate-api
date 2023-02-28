import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { handleError } from 'src/utils/handleError';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async signup(signupDto: SignupDto): Promise<{ user: UserEntity }> {
    const salt = await bcrypt.genSalt(Number(process.env.HASH_SALT) || 10);
    const hash = await bcrypt.hash(signupDto.password, salt);
    const user = { ...signupDto, password: hash };
    try {
      const newUser = await this.prisma.users.create({ data: user });
      return { user: newUser };
    } catch (e: unknown) {
      throw handleError(e);
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
