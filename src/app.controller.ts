import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Domain } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get('/domains')
  async getDomains(): Promise<{
    domains: Domain[];
  }> {
    return await this.appService.getDomains();
  }
}
