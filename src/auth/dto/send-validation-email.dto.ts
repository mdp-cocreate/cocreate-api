import { IsEmail } from 'class-validator';

export class SendValidationEmailDto {
  @IsEmail()
  email: string;
}
