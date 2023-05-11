import { User } from '@prisma/client';

type SensitiveData = 'password' | 'validateEmailToken' | 'resetPasswordToken';

export type UserEntityWithoutSensitiveData = Omit<
  User,
  SensitiveData | 'isEmailValidated'
>;

export type FormattedUserEntityWithoutSensitiveData = Omit<
  UserEntityWithoutSensitiveData,
  'profilePicture'
> & {
  profilePicture: string | null;
};
