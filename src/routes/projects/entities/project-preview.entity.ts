import { Projects, Role } from '@prisma/client';
import { UserEntityWithoutSensitiveData } from 'src/routes/users/entities/user.entity';

export type ProjectPreviewEntity = Omit<
  Projects,
  'coverImage' | 'public' | 'description' | 'updatedAt'
> & {
  coverImage: string | null;
  members: {
    role: Role;
    user: Omit<
      UserEntityWithoutSensitiveData,
      'email' | 'country' | 'skills' | 'registeredAt' | 'profilePicture'
    > & { profilePicture: string | null };
  }[];
};
