import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { CreateItemDto } from '../../dto/create-item-dto';

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @IsEmail()
  @IsNotEmpty()
  authorEmail: string;
}
