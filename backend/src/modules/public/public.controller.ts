import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CentersService } from '../centers/centers.service';
import { ServicesService } from '../services/services.service';
import { BookingsService } from '../bookings/bookings.service';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly centersService: CentersService,
    private readonly servicesService: ServicesService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Get('centers')
  @Public()
  @ApiOperation({ summary: 'Get all car wash centers (public)' })
  async getAllCenters() {
    return this.centersService.findAll();
  }

  @Get('centers/nearby')
  @Public()
  @ApiOperation({ summary: 'Get nearby car wash centers' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Radius in kilometers' })
  async getNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 10;

    // TODO: Implement geospatial search in your service
    // For now, return all centers
    return this.centersService.findAll();
  }

  @Get('centers/:id')
  @Public()
  @ApiOperation({ summary: 'Get car wash center details (public)' })
  async getCenterDetails(@Param('id') id: string) {
    return this.centersService.findOne(id);
  }

  @Get('centers/:id/services')
  @Public()
  @ApiOperation({ summary: 'Get services for a car wash center (public)' })
  async getCenterServices(@Param('id') id: string) {
    return this.servicesService.findByCenter(id);
  }

  @Get('bookings/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user bookings' })
  async getMyBookings(@CurrentUser('id') userId: string) {
    // Get or create customer record
    const customer = await this.bookingsService.getOrCreateCustomer(userId, null);
    
    // Get bookings for this customer
    const result = await this.bookingsService.findAll({
      customerId: customer.id,
    });
    
    return result.data;
  }

  @Post('bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a booking (authenticated users)' })
  async createBooking(@Body() bookingData: any, @CurrentUser('id') userId: string) {
    // Ensure customer record exists for this user
    let customer = await this.bookingsService.getOrCreateCustomer(userId, null);
    
    // Use customer ID instead of user ID
    const bookingDto = {
      ...bookingData,
      customerId: customer.id,
    };
    return this.bookingsService.create(bookingDto);
  }
}
