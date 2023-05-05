import { Projects } from '@prisma/client';

export type ProjectPreviewEntity = Omit<
  Projects,
  'public' | 'description' | 'updatedAt'
> & {
  members: {
    profilePicture: Buffer | null;
  }[];
};
