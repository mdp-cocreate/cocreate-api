import { Project, Role, Skill } from '@prisma/client';

export type RetrievedProject = Project & {
  skills: Omit<Skill, 'domainId'>[];
  members: RetrievedProjectMember[];
};

export type RetrievedProjectMember = {
  role: Role;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture: Buffer | null;
  };
};

export type FormattedRetrievedProjectMember = Omit<
  RetrievedProjectMember,
  'user'
> & {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
};

export type FormattedRetrievedProject = Omit<
  RetrievedProject,
  'coverImage' | 'members'
> & {
  coverImage: string | null;
  members: FormattedRetrievedProjectMember[];
};
