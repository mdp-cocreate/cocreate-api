import { User } from '@prisma/client';

type SensitiveData = 'password' | 'validateEmailToken' | 'resetPasswordToken';

export type UserWithoutSensitiveData = Omit<
  User,
  SensitiveData | 'isEmailValidated'
>;

export type FormattedUserWithoutSensitiveData = Omit<
  UserWithoutSensitiveData,
  'profilePicture'
> & {
  profilePicture: string | null;
};
