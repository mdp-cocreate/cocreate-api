import { ProjectItems } from '@prisma/client';

export class ProjectItemEntity implements ProjectItems {
  id: number;
  name: string;
  description: string | null;
  link: string | null;
  associatedFile: Buffer | null;
  authorId: number;
  projectId: number;
  createdAt: Date;
}
