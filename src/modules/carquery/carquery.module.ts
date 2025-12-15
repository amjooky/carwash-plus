import { Module } from '@nestjs/common';
import { CarQueryController } from './carquery.controller';
import { CarQueryService } from './carquery.service';

@Module({
  controllers: [CarQueryController],
  providers: [CarQueryService],
  exports: [CarQueryService],
})
export class CarQueryModule {}
