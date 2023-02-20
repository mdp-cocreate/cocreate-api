import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello(): string {
    return `Hello world! ${this.configService.get<string>('FRONT_URL')}`;
  }
}
