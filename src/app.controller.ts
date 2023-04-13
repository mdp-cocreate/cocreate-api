import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Domains } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get('/domains')
  async getDomains(): Promise<{
    domains: Domains[];
  }> {
    return await this.appService.getDomains();
  }
}
