export const projectItemRetrieveFormat = () => ({
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
});
