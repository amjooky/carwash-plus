import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '@prisma/client';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get dashboard overview with KPIs' })
  async getOverview(@CurrentUser() user?: User & { ownedCenter?: { id: string } }) {
    const centerId = user?.ownedCenter?.id;
    return this.dashboardService.getOverview(centerId);
  }

  @Get('revenue-trend')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get revenue trend for specified days' })
  async getRevenueTrend(
    @Query('days') days?: string,
    @CurrentUser() user?: User & { ownedCenter?: { id: string } },
  ) {
    const numDays = days ? parseInt(days) : 30;
    const centerId = user?.ownedCenter?.id;
    return this.dashboardService.getRevenueTrend(numDays, centerId);
  }

  @Get('bookings-today')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all bookings for today' })
  async getBookingsToday(@CurrentUser() user?: User & { ownedCenter?: { id: string } }) {
    const centerId = user?.ownedCenter?.id;
    return this.dashboardService.getBookingsToday(centerId);
  }

  @Get('staff-performance')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get staff performance metrics' })
  async getStaffPerformance(@CurrentUser() user?: User & { ownedCenter?: { id: string } }) {
    const centerId = user?.ownedCenter?.id;
    return this.dashboardService.getStaffPerformance(centerId);
  }

  @Get('popular-services')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get most popular services' })
  async getPopularServices(
    @Query('limit') limit?: string,
    @CurrentUser() user?: User & { ownedCenter?: { id: string } },
  ) {
    const numLimit = limit ? parseInt(limit) : 5;
    const centerId = user?.ownedCenter?.id;
    return this.dashboardService.getPopularServices(numLimit, centerId);
  }

  @Get('recent-activity')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get recent system activity' })
  async getRecentActivity(
    @Query('limit') limit?: string,
    @CurrentUser() user?: User & { ownedCenter?: { id: string } },
  ) {
    const numLimit = limit ? parseInt(limit) : 10;
    const centerId = user?.ownedCenter?.id;
    return this.dashboardService.getRecentActivity(numLimit, centerId);
  }
}
