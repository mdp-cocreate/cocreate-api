import { Action, Skill, User } from '@prisma/client';

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

export type RetrievedUserProfile = {
  id: number;
  slug: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture: Buffer | null;
  registeredAt: Date | null;
  skills: Skill[];
  actions: Action[];
  isEmailValidated: boolean | null;
};

export type FormattedRetrievedUserProfile = Omit<
  RetrievedUserProfile,
  'profilePicture'
> & {
  profilePicture: string | null;
};
