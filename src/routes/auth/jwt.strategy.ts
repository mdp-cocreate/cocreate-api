/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserWithoutSensitiveData } from 'src/routes/users/entities/user.entity';
import { jwtConstants } from './constants';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      secretOrKey: jwtConstants.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate({ id }: JwtPayload): Promise<UserWithoutSensitiveData> {
    const userFound = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userFound) throw new UnauthorizedException();

    const {
      password,
      resetPasswordToken,
      validateEmailToken,
      isEmailValidated,
      ...formattedUser
    } = userFound;

    return formattedUser;
  }
}
