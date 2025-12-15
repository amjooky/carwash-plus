import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CarQueryService } from './carquery.service';

@ApiTags('CarQuery')
@Controller('carquery')
export class CarQueryController {
  constructor(private readonly carQueryService: CarQueryService) {}

  @Get('makes')
  @ApiOperation({ summary: 'Get car makes by year' })
  @ApiQuery({ name: 'year', required: true })
  getMakes(@Query('year') year: string) {
    return this.carQueryService.getMakes(year);
  }

  @Get('models')
  @ApiOperation({ summary: 'Get car models by make and year' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'make', required: true })
  getModels(@Query('year') year: string, @Query('make') make: string) {
    return this.carQueryService.getModels(year, make);
  }

  @Get('trims')
  @ApiOperation({ summary: 'Get car trims by make, model and year' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'make', required: true })
  @ApiQuery({ name: 'model', required: true })
  getTrims(
    @Query('year') year: string,
    @Query('make') make: string,
    @Query('model') model: string,
  ) {
    return this.carQueryService.getTrims(year, make, model);
  }
}
