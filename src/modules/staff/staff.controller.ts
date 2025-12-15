import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto, CreateShiftDto } from './dto/staff.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '@prisma/client';

@ApiTags('Staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new staff member' })
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all staff' })
  @ApiQuery({ name: 'centerId', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('centerId') centerId?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: User & { ownedCenter?: { id: string } },
  ) {
    // If Center Admin, force centerId
    if (user?.ownedCenter?.id) {
      centerId = user.ownedCenter.id;
    }

    // If Super Admin and NO centerId provided, return empty list
    // This prevents showing "all staff" globally which is clutter
    if (user?.role === UserRole.SUPER_ADMIN && !centerId) {
      const p = page ? parseInt(page) : 1;
      const l = limit ? parseInt(limit) : 20;
      return {
        data: [],
        meta: {
          total: 0,
          page: p,
          limit: l,
          totalPages: 0,
        },
      };
    }

    return this.staffService.findAll(
      centerId,
      isActive ? isActive === 'true' : undefined,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get('leaderboard')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get staff leaderboard' })
  @ApiQuery({ name: 'limit', required: false })
  getLeaderboard(@Query('limit') limit?: string) {
    return this.staffService.getLeaderboard(limit ? parseInt(limit) : undefined);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get staff by ID' })
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update staff' })
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updateStaffDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate staff' })
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }

  @Get(':id/performance')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get staff performance metrics' })
  getPerformance(@Param('id') id: string) {
    return this.staffService.getPerformance(id);
  }

  @Get(':id/schedule')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get staff schedule' })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  getSchedule(
    @Param('id') id: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.staffService.getSchedule(
      id,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
    );
  }

  @Post(':id/shifts')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a shift for staff member' })
  createShift(@Param('id') id: string, @Body() createShiftDto: CreateShiftDto) {
    return this.staffService.createShift(id, createShiftDto);
  }
}
