import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/routes/auth/auth.module';
import { ItemsController } from './items/items.controller';
import { ItemsService } from './items/items.service';

@Module({
  controllers: [ProjectsController, ItemsController],
  providers: [ProjectsService, ItemsService],
  imports: [PrismaModule, AuthModule],
})
export class ProjectsModule {}
