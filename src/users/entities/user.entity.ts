import { Users } from '@prisma/client';

export class UserEntity implements Users {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string | null;
  profilePicture: Buffer | null;
  registeredAt: Date;
}
