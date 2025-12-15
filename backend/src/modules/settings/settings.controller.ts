import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto, UpdateSettingDto } from './dto/setting.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles, RequirePermissions, Public } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Get public settings' })
  findPublic() {
    return this.settingsService.findPublic();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('settings.view')
  @ApiOperation({ summary: 'Get all settings' })
  findAll(@Query('category') category?: string) {
    return this.settingsService.findAll(category);
  }

  @Get('category/:category')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('settings.view')
  @ApiOperation({ summary: 'Get settings by category' })
  getByCategory(@Param('category') category: string) {
    return this.settingsService.getByCategory(category);
  }

  @Get(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('settings.view')
  @ApiOperation({ summary: 'Get setting by key' })
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN)
  @RequirePermissions('settings.update')
  @ApiOperation({ summary: 'Create setting' })
  create(@Body() dto: CreateSettingDto, @CurrentUser('id') userId: string) {
    return this.settingsService.create(dto, userId);
  }

  @Patch(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN)
  @RequirePermissions('settings.update')
  @ApiOperation({ summary: 'Update setting' })
  update(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.settingsService.update(key, dto, userId);
  }

  @Delete(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN)
  @RequirePermissions('settings.update')
  @ApiOperation({ summary: 'Delete setting' })
  remove(@Param('key') key: string, @CurrentUser('id') userId: string) {
    return this.settingsService.remove(key, userId);
  }
}
