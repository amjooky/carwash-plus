import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, AddVehicleDto, AddLoyaltyPointsDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '@prisma/client';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new customer' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all customers' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @CurrentUser() user?: User & { ownedCenter?: { id: string } },
  ) {
    let centerId: string | undefined;
    if (user?.ownedCenter?.id) {
      centerId = user.ownedCenter.id;
    }

    return this.customersService.findAll(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
      search,
      centerId,
    );
  }

  @Get('leaderboard')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get customer leaderboard by loyalty points' })
  @ApiQuery({ name: 'limit', required: false })
  getLeaderboard(@Query('limit') limit?: string) {
    return this.customersService.getLeaderboard(limit ? parseInt(limit) : undefined);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get customer by ID' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update customer' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete customer' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }

  @Get(':id/bookings')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get customer booking history' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getBookingHistory(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.customersService.getBookingHistory(
      id,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get(':id/loyalty')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get customer loyalty information' })
  getLoyaltyInfo(@Param('id') id: string) {
    return this.customersService.getLoyaltyInfo(id);
  }

  @Post(':id/loyalty')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add loyalty points to customer' })
  addLoyaltyPoints(@Param('id') id: string, @Body() addPointsDto: AddLoyaltyPointsDto) {
    return this.customersService.addLoyaltyPoints(id, addPointsDto);
  }

  @Get(':id/vehicles')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get customer vehicles' })
  getVehicles(@Param('id') id: string) {
    return this.customersService.getVehicles(id);
  }

  @Post(':id/vehicles')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add vehicle to customer' })
  addVehicle(@Param('id') id: string, @Body() addVehicleDto: AddVehicleDto) {
    return this.customersService.addVehicle(id, addVehicleDto);
  }

  @Delete(':id/vehicles/:vehicleId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete customer vehicle' })
  deleteVehicle(@Param('id') id: string, @Param('vehicleId') vehicleId: string) {
    return this.customersService.deleteVehicle(id, vehicleId);
  }
}
