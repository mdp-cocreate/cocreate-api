import { IsEmail } from 'class-validator';

export class SendAccountValidationEmailDto {
  @IsEmail()
  email: string;
}
