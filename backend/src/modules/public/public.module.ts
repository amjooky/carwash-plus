import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { CentersModule } from '../centers/centers.module';
import { ServicesModule } from '../services/services.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [CentersModule, ServicesModule, BookingsModule],
  controllers: [PublicController],
})
export class PublicModule {}
