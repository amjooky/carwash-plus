import { Module } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { BookingsService } from '../bookings/bookings.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, BookingsService],
  exports: [PaymentsService],
})
export class PaymentsModule { }
