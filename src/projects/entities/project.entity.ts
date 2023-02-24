import { Projects } from '@prisma/client';

export class ProjectEntity implements Projects {
  id: number;
  name: string;
  description: string | null;
  coverImage: Buffer | null;
  public: boolean;
  createdAt: Date;
  updatedAt: Date;
}
