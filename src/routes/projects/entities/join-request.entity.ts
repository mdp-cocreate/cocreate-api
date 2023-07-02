export type RetrievedJoinRequest = {
  user: {
    slug: string;
    firstName: string;
    lastName: string;
  };
  project: {
    slug: string;
    name: string;
  };
  createdAt: Date;
};
