import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsOptional()
  associatedFile?: Buffer;
}
