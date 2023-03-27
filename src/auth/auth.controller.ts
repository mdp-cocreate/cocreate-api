import { Body, Controller, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendValidationEmailDto } from './dto/send-validation-email.dto';
import { SignupDto } from './dto/signup.dto';
import { ValidateEmailDto } from './dto/validate-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<void> {
    return await this.authService.signup(signupDto);
  }

  @Post('send-validation-email')
  async sendValidationEmail(
    @Body() sendValidationEmailDto: SendValidationEmailDto
  ) {
    return await this.authService.sendAccountValidationEmail(
      sendValidationEmailDto
    );
  }

  @Patch('validate-email')
  async validateEmail(@Body() validateEmailDto: ValidateEmailDto) {
    return await this.authService.validateEmail(validateEmailDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    return await this.authService.login(loginDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() { email }: ResetPasswordDto) {
    return await this.authService.sendResetPasswordEmail(email);
  }

  @Patch('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return await this.authService.changePassword(changePasswordDto);
  }
}
