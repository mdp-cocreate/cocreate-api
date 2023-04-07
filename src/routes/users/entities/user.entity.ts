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
  isEmailValidated: boolean;
  validateEmailToken: string | null;
  resetPasswordToken: string | null;
}

type SensitiveData = 'password' | 'validateEmailToken' | 'resetPasswordToken';

export type UserEntityWithoutSensitiveData = Omit<
  UserEntity,
  SensitiveData | 'isEmailValidated'
>;
