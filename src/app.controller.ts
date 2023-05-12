import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Domain, DomainName, Skill } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get('domains')
  async getDomains(): Promise<{
    domains: Domain[];
  }> {
    return await this.appService.getDomains();
  }

  @Get('skills')
  async getSkillsByDomains(
    @Query('domains') domains: string
  ): Promise<{ skills: Skill[] }> {
    const domainList = domains.split(',');
    return await this.appService.getSkillsByDomains(domainList as DomainName[]);
  }
}
