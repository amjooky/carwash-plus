import { Module } from '@nestjs/common';
import { CentersController } from './centers.controller';
import { AvailabilityController } from './availability.controller';
import { CentersService } from './centers.service';
import { AvailabilityService } from './availability.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CentersController, AvailabilityController],
  providers: [CentersService, AvailabilityService],
  exports: [CentersService, AvailabilityService],
})
export class CentersModule { }
