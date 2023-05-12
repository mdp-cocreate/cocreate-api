import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { handleError } from 'src/utils/handleError';
import { ValidateEmailDto } from './dto/validate-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendAccountValidationEmailDto } from './dto/send-account-validation-email.dto';
import { SendResetPasswordEmailDto } from './dto/send-reset-password-email.dto';
import slugify from 'slugify';
import { transporter } from 'src/utils/transporter';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(registerDto: RegisterDto) {
    const salt = await bcrypt.genSalt(Number(process.env.HASH_SALT));
    const hash = await bcrypt.hash(registerDto.password, salt);
    const user = { ...registerDto, password: hash };

    const baseSlug = slugify(`${user.firstName}-${user.lastName}`, {
      lower: true,
    });
    let slug = baseSlug;
    let sequence = 0;

    while (await this.prisma.user.findUnique({ where: { slug } })) {
      slug = `${baseSlug}${sequence ? `-${sequence}` : ''}`;
      sequence++;
    }

    try {
      const { skills, ...data } = user;
      const newUser = await this.prisma.user.create({
        data: {
          ...data,
          slug,
          skills: { connect: skills.map((skill) => ({ name: skill })) },
        },
      });

      await this.sendAccountValidationEmail({ email: newUser.email });
    } catch (e: unknown) {
      throw handleError(e);
    }
  }

  async sendAccountValidationEmail({ email }: SendAccountValidationEmailDto) {
    const user = await this.prisma.user.findUnique({
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

    await this.prisma.user.update({
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

    await transporter.sendMail(mailOptions);
  }

  async validateEmail({ email, token }: ValidateEmailDto) {
    const user = await this.prisma.user.findUnique({
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

    await this.prisma.user.update({
      where: { email },
      data: {
        isEmailValidated: true,
        validateEmailToken: null,
      },
    });
  }

  async login({ email, password }: LoginDto): Promise<{ token: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, isEmailValidated: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException();

    if (!user.isEmailValidated)
      throw new ForbiddenException(
        'you must validate your email before login in'
      );

    const payload: JwtPayload = { id: user.id };
    const token = this.jwtService.sign(payload);
    return { token };
  }

  async sendResetPasswordEmail({ email }: SendResetPasswordEmailDto) {
    const user = await this.prisma.user.findUnique({
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

    await this.prisma.user.update({
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

  async resetPassword({ email, newPassword, token }: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
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

    await this.prisma.user.update({
      where: { email },
      data: {
        password: hash,
        resetPasswordToken: null,
      },
    });
  }
}
