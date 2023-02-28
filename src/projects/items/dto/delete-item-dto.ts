import { IsEmail, IsNotEmpty } from 'class-validator';

export class DeleteItemDto {
  @IsEmail()
  @IsNotEmpty()
  authorEmail: string;
}
