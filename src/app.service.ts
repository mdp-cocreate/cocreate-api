import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { handleError } from './utils/handleError';
import { Domain, DomainName } from '@prisma/client';

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

  async getSkillsByDomains(domains: DomainName[]) {
    const skills = await this.prisma.skill.findMany({
      where: {
        domain: {
          name: {
            in: domains,
          },
        },
      },
    });

    return { skills };
  }
}
