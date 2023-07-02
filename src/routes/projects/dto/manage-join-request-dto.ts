import { IsNotEmpty, IsString } from 'class-validator';

export class ManageJoinRequestDto {
  @IsString()
  @IsNotEmpty()
  projectSlug: string;

  @IsString()
  @IsNotEmpty()
  userSlug: string;
}
