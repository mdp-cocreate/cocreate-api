import { Project, Role } from '@prisma/client';

export type RetrievedProjectPreview = Omit<
  Project,
  'public' | 'description' | 'updatedAt'
> & {
  members: RetrievedProjectPreviewMember[];
};

export type RetrievedProjectPreviewMember = {
  role: Role;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture: Buffer | null;
  };
};

export type FormattedRetrievedProjectPreviewMember = Omit<
  RetrievedProjectPreviewMember,
  'user'
> & {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
};

export type FormattedRetrievedProjectPreview = Omit<
  RetrievedProjectPreview,
  'coverImage' | 'members'
> & {
  coverImage: string | null;
  members: FormattedRetrievedProjectPreviewMember[];
};
