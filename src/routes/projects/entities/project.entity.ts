import { Domains, Projects, Role } from '@prisma/client';

export class ProjectEntity implements Projects {
  id: number;
  name: string;
  description: string | null;
  shortDescription: string | null;
  coverImage: Buffer | null;
  public: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type RetrievedProjectMember = {
  role: Role;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture: Buffer | null;
  };
};

export type FormattedRetrievedProjectMember = {
  role: Role;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
};

export type RetrievedProject = ProjectEntity & {
  domains: Domains[];
  members: RetrievedProjectMember[];
};

export type FormattedRetrievedProject = Omit<
  RetrievedProject,
  'coverImage' | 'members'
> & {
  coverImage: string | null;
  members: FormattedRetrievedProjectMember[];
};
