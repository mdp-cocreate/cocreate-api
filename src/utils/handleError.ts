import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export const handleError = (e: unknown) => {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') throw new ConflictException(e.meta?.cause);
    if (e.code === 'P2003' || e.code === 'P2025')
      throw new NotFoundException(e.meta?.cause);
  } else throw new InternalServerErrorException();
};
