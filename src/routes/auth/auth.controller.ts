import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendResetPasswordEmailDto } from './dto/send-reset-password-email.dto';
import { SendAccountValidationEmailDto } from './dto/send-account-validation-email.dto';
import { SignupDto } from './dto/signup.dto';
import { ValidateEmailDto } from './dto/validate-email.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return await this.authService.signup(signupDto);
  }

  @Post('send-account-validation-email')
  async sendAccountValidationEmail(
    @Body() sendAccountValidationEmailDto: SendAccountValidationEmailDto
  ) {
    return await this.authService.sendAccountValidationEmail(
      sendAccountValidationEmailDto
    );
  }

  @Patch('validate-email')
  async validateEmail(@Body() validateEmailDto: ValidateEmailDto) {
    return await this.authService.validateEmail(validateEmailDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    return await this.authService.login(loginDto);
  }

  @Post('send-reset-password-email')
  async sendResetPasswordEmail(
    @Body() sendResetPasswordEmailDto: SendResetPasswordEmailDto
  ) {
    return await this.authService.sendResetPasswordEmail(
      sendResetPasswordEmailDto
    );
  }

  @Patch('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('is-authenticated')
  async isAuthenticated(): Promise<boolean> {
    return true;
  }
}
