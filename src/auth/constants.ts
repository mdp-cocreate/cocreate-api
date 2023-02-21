import * as dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export const jwtConstants = {
  secret: process.env.SECRET,
};
