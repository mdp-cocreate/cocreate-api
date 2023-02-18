import { ApiProperty } from '@nestjs/swagger';
import { Users } from '@prisma/client';

export class UserEntity implements Users {
  @ApiProperty()
  id: number;

  @ApiProperty({ uniqueItems: true })
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ required: false, nullable: true })
  country: string | null;

  @ApiProperty({ required: false, nullable: true })
  profilePicture: Buffer | null;

  @ApiProperty({ required: false })
  registeredAt: Date;
}
