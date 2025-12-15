import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles, RequirePermissions } from '@/common/decorators/auth.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('analytics.view')
  @ApiOperation({ summary: 'Get dashboard analytics' })
  getDashboard() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('analytics.view')
  @ApiOperation({ summary: 'Get user analytics' })
  getUserStats() {
    return this.analyticsService.getUserStats();
  }

  @Get('activity')
  @Roles(UserRole.SUPER_ADMIN)
  @RequirePermissions('analytics.view.all')
  @ApiOperation({ summary: 'Get activity analytics' })
  getActivityStats() {
    return this.analyticsService.getActivityStats(7);
  }
}
