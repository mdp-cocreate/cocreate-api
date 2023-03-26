import { Body, Controller, Patch, Post } from '@nestjs/common';
import { UserEntity } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<{ user: UserEntity }> {
    return await this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    return await this.authService.login(loginDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() { email }: ResetPasswordDto) {
    await this.authService.sendResetPasswordEmail(email);
  }

  @Patch('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    await this.authService.changePassword(changePasswordDto);
  }
}
