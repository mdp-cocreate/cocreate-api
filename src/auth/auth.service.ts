import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { handleError } from 'src/utils/handleError';
import { ValidateEmailDto } from './dto/validate-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendAccountValidationEmailDto } from './dto/send-account-validation-email.dto';
import { SendResetPasswordEmailDto } from './dto/send-reset-password-email.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async signup(signupDto: SignupDto) {
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

      await this.sendAccountValidationEmail({ email: newUser.email });
    } catch (e: unknown) {
      throw handleError(e);
    }
  }

  async sendAccountValidationEmail({ email }: SendAccountValidationEmailDto) {
    const user = await this.prisma.users.findUnique({
      where: {
        email,
      },
      select: {
        isEmailValidated: true,
      },
    });

    if (!user) throw new NotFoundException();

    if (user.isEmailValidated)
      throw new ConflictException('this account has already been validated');

    const data = email + new Date().getTime() + process.env.SECRET;
    const salt = await bcrypt.genSalt(Number(process.env.HASH_SALT));
    const token = await bcrypt.hash(data, salt);

    await this.prisma.users.update({
      where: {
        email,
      },
      data: {
        validateEmailToken: token,
      },
    });

    const link = `${
      process.env.FRONT_URL
    }/validate-email?user=${email}&token=${encodeURIComponent(token)}`;

    const mailOptions = {
      from: process.env.GMAIL,
      to: email,
      subject: 'Validate your email',
      text: `Click on this link to validate your email: ${link}`,
    };

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail(mailOptions);
  }

  async validateEmail({ email, token }: ValidateEmailDto) {
    const user = await this.prisma.users.findUnique({
      where: {
        email,
      },
      select: {
        isEmailValidated: true,
        validateEmailToken: true,
      },
    });

    if (!user) throw new NotFoundException();

    if (user.isEmailValidated)
      throw new ConflictException('this account has already been validated');

    if (user.validateEmailToken !== decodeURIComponent(token))
      throw new UnauthorizedException();

    await this.prisma.users.update({
      where: { email },
      data: {
        isEmailValidated: true,
        validateEmailToken: null,
      },
    });
  }

  async login({ email, password }: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.prisma.users.findUnique({
      where: { email },
      select: { email: true, password: true, isEmailValidated: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException();

    if (!user.isEmailValidated)
      throw new ForbiddenException(
        'you must validate your email before login in'
      );

    const payload: JwtPayload = { email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async sendResetPasswordEmail({ email }: SendResetPasswordEmailDto) {
    const user = await this.prisma.users.findUnique({
      where: {
        email,
      },
      select: {
        isEmailValidated: true,
      },
    });

    if (!user) throw new NotFoundException();
    if (!user.isEmailValidated)
      throw new ForbiddenException('you must validate your email before');

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

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail(mailOptions);
  }

  async resetPassword({ email, newPassword, token }: ResetPasswordDto) {
    const user = await this.prisma.users.findUnique({
      where: {
        email,
      },
      select: {
        resetPasswordToken: true,
        isEmailValidated: true,
      },
    });

    if (!user || user.resetPasswordToken !== decodeURIComponent(token))
      throw new UnauthorizedException();

    if (!user.isEmailValidated)
      throw new ForbiddenException('you must validate your email before');

    const salt = await bcrypt.genSalt(Number(process.env.HASH_SALT));
    const hash = await bcrypt.hash(newPassword, salt);

    await this.prisma.users.update({
      where: { email },
      data: {
        password: hash,
        resetPasswordToken: null,
      },
    });
  }
}
