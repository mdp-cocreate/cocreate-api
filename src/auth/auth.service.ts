import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { handleError } from 'src/utils/handleError';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async signup(signupDto: SignupDto): Promise<{ user: UserEntity }> {
    const salt = await bcrypt.genSalt(Number(process.env.HASH_SALT));
    const hash = await bcrypt.hash(signupDto.password, salt);
    const user = { ...signupDto, password: hash };

    try {
      const { domains, ...data } = user;
      const newUser = await this.prisma.users.create({
        data: {
          ...data,
          domains: { connect: domains.map((domain) => ({ name: domain })) },
        },
      });

      return { user: newUser };
    } catch (e: unknown) {
      throw handleError(e);
    }
  }

  async login({ email, password }: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.prisma.users.findUnique({
      where: { email },
      select: { email: true, password: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException();

    const payload: JwtPayload = { email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async sendResetPasswordEmail(email: string): Promise<void> {
    const user = await this.prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASS,
      },
    });

    const data = email + new Date().getTime() + process.env.SECRET;
    const salt = await bcrypt.genSalt(Number(process.env.HASH_SALT));
    const token = await bcrypt.hash(data, salt);

    await this.prisma.users.update({
      where: {
        email,
      },
      data: {
        resetPasswordToken: token,
      },
    });

    const link = `${
      process.env.FRONT_URL
    }/change-password?user=${email}&token=${encodeURIComponent(token)}`;

    const mailOptions = {
      from: process.env.GMAIL,
      to: email,
      subject: 'Reset your password',
      text: `Click on this link to reset your password: ${link}`,
    };

    await transporter.sendMail(mailOptions);
  }

  async changePassword({ email, newPassword, token }: ChangePasswordDto) {
    const user = await this.prisma.users.findUnique({
      where: {
        email,
      },
      select: {
        resetPasswordToken: true,
      },
    });

    if (!user) {
      throw new NotFoundException();
    } else if (user.resetPasswordToken !== decodeURIComponent(token)) {
      throw new UnauthorizedException();
    }

    const salt = await bcrypt.genSalt(Number(process.env.HASH_SALT));
    const hash = await bcrypt.hash(newPassword, salt);

    await this.prisma.users.update({
      where: { email },
      data: {
        password: hash,
      },
    });
  }
}
