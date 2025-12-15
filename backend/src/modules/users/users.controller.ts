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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles, RequirePermissions } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('users.create')
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() dto: CreateUserDto, @CurrentUser('id') userId: string) {
    return this.usersService.create(dto, userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('users.view')
  @ApiOperation({ summary: 'Get all users' })
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, dto, userId);
  }

  @Get('me/vehicles')
  @ApiOperation({ summary: 'Get current user vehicles' })
  getMyVehicles(@CurrentUser('id') userId: string) {
    return this.usersService.getMyVehicles(userId);
  }

  @Post('me/vehicles')
  @ApiOperation({ summary: 'Add vehicle to current user' })
  addMyVehicle(@CurrentUser('id') userId: string, @Body() vehicleDto: any) {
    return this.usersService.addMyVehicle(userId, vehicleDto);
  }

  @Patch('me/vehicles/:vehicleId')
  @ApiOperation({ summary: 'Update user vehicle' })
  updateMyVehicle(
    @CurrentUser('id') userId: string,
    @Param('vehicleId') vehicleId: string,
    @Body() vehicleDto: any,
  ) {
    return this.usersService.updateMyVehicle(userId, vehicleId, vehicleDto);
  }

  @Patch('fcm-token')
  @ApiOperation({ summary: 'Update FCM token for push notifications' })
  async updateFcmToken(
    @CurrentUser('id') userId: string,
    @Body('fcmToken') fcmToken: string,
  ) {
    return this.usersService.updateFcmToken(userId, fcmToken);
  }

  @Delete('me/vehicles/:vehicleId')
  @ApiOperation({ summary: 'Delete user vehicle' })
  deleteMyVehicle(
    @CurrentUser('id') userId: string,
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.usersService.deleteMyVehicle(userId, vehicleId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('users.view')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('users.update')
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('users.delete')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.usersService.remove(id, userId);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @RequirePermissions('users.status')
  @ApiOperation({ summary: 'Update user status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.updateStatus(id, status, userId);
  }
}
