import { Prisma } from '@prisma/client';
import { ProjectFiltersDto } from 'src/projects/dto/project-filters-dto';

export const projectRetrievalFormat = ({
  selectDomains,
  selectMembers,
  selectItems,
  selectActions,
}: ProjectFiltersDto): Prisma.ProjectsInclude => ({
  domains: selectDomains,
  members: selectMembers && {
    select: {
      role: true,
      addedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          country: true,
          profilePicture: true,
          registeredAt: true,
        },
      },
    },
  },
  items: selectItems && {
    select: {
      id: true,
      name: true,
      description: true,
      link: true,
      associatedFile: true,
      author: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
        },
      },
    },
  },
  actions: selectActions && {
    select: {
      author: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      name: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  },
});
