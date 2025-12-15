import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CentersService } from './centers.service';
import { CreateCenterDto } from './dto/create-center.dto';
import { UpdateCenterDto } from './dto/update-center.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Centers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('centers')
export class CentersController {
  constructor(private readonly centersService: CentersService) { }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all centers' })
  findAll(@CurrentUser() user: any) {
    return this.centersService.findAll(user);
  }

  // Owner convenience endpoints (must come before /:id)
  @Get('my')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get my center (owner)' })
  getMyCenter(@CurrentUser() user: any) {
    return this.centersService.findByOwner(user.id);
  }

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get all centers (public)' })
  findAllPublic() {
    return this.centersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get center by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.centersService.findOne(id, user);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create new center',
    description: 'Create a new car wash center. Optionally create an owner/admin account by setting createOwner to true.'
  })
  create(@Body() createCenterDto: CreateCenterDto) {
    return this.centersService.create(createCenterDto);
  }

  @Put('my')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update my center (owner)' })
  async updateMyCenter(@Body() updateCenterDto: UpdateCenterDto, @CurrentUser() user: any) {
    const center = await this.centersService.findByOwner(user.id);
    if (!center) throw new ForbiddenException('No center assigned to your account');
    return this.centersService.update(center.id, updateCenterDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update center by ID' })
  async update(@Param('id') id: string, @Body() updateCenterDto: UpdateCenterDto, @CurrentUser() user: any) {
    if (user.role === 'ADMIN') {
      const canEdit = await this.centersService.canUserEditCenter(user.id, id);
      if (!canEdit) throw new ForbiddenException('You can only edit your own center');
    }
    return this.centersService.update(id, updateCenterDto);
  }

  @Get(':id/availability')
  @Public()
  @ApiOperation({ summary: 'Get center availability (public)' })
  @ApiQuery({ name: 'date', required: true })
  getAvailability(@Param('id') id: string, @Query('date') date: string) {
    return this.centersService.getAvailability(id, date);
  }

  @Get(':id/availability/bays')
  @Public()
  @ApiOperation({ summary: 'Get available bays (public)' })
  @ApiQuery({ name: 'date', required: true })
  @ApiQuery({ name: 'time', required: true })
  getAvailableBays(
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('time') time: string,
  ) {
    return this.centersService.getAvailableBays(id, date, time);
  }
}
