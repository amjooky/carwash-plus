import { Controller, Get, Query, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { QueryLogDto } from './dto/log.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles, RequirePermissions } from '@/common/decorators/auth.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Logs')
@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('logs.view')
  @ApiOperation({ summary: 'Get all logs' })
  findAll(@Query() query: QueryLogDto) {
    return this.logsService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN)
  @RequirePermissions('logs.view.all')
  @ApiOperation({ summary: 'Get log statistics' })
  getStats() {
    return this.logsService.getStats();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('logs.view')
  @ApiOperation({ summary: 'Get log by ID' })
  findOne(@Param('id') id: string) {
    return this.logsService.findOne(id);
  }

  @Delete('old')
  @Roles(UserRole.SUPER_ADMIN)
  @RequirePermissions('logs.delete')
  @ApiOperation({ summary: 'Delete logs older than 30 days' })
  deleteOld() {
    return this.logsService.deleteOld(30);
  }
}
