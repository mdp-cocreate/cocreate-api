import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { handleError } from './utils/handleError';
import { Domain } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getDomains(): Promise<{
    domains: Domain[];
  }> {
    try {
      const domains = await this.prisma.domain.findMany();
      return { domains };
    } catch (e) {
      throw handleError(e);
    }
  }
}
