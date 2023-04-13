import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { handleError } from './utils/handleError';
import { Domains } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getDomains(): Promise<{
    domains: Domains[];
  }> {
    try {
      const domains = await this.prisma.domains.findMany();
      return { domains };
    } catch (e) {
      throw handleError(e);
    }
  }
}
