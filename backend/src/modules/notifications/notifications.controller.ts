import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, BroadcastNotificationDto } from './dto/notification.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/auth.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get current user notifications' })
    findUserNotifications(@CurrentUser('id') userId: string) {
        return this.notificationsService.findUserNotifications(userId);
    }

    @Post('broadcast')
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Broadcast promotional notification to all users' })
    broadcast(@Body() dto: BroadcastNotificationDto) {
        return this.notificationsService.broadcast(dto);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.notificationsService.markAsRead(id, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete notification' })
    delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.notificationsService.delete(id, userId);
    }

    @Get('all')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get all notifications (admin)' })
    findAll() {
        return this.notificationsService.findAll();
    }
}
