import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from '../notifications/notifications.service';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@ApiTags('Test')
@Controller('test')
export class TestController {
    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly firebaseService: FirebaseService,
        private readonly prisma: PrismaService,
    ) { }

    @Post('send-notification')
    @ApiOperation({ summary: 'Test: Send notification to a user' })
    async sendTestNotification(@Body() body: { userId: string; title: string; message: string }) {
        const { userId, title, message } = body;

        // Get user's FCM token
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { fcmToken: true, email: true },
        });

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (!user.fcmToken) {
            return { success: false, message: 'User has no FCM token registered' };
        }

        // Create notification in database
        await this.notificationsService.create({
            userId,
            type: 'PROMOTIONAL',
            title,
            message,
        });

        // Send push notification
        const sent = await this.firebaseService.sendPushNotification(
            user.fcmToken,
            title,
            message,
            { type: 'TEST' },
        );

        return {
            success: sent,
            message: sent ? 'Notification sent successfully' : 'Failed to send notification',
            userEmail: user.email,
            fcmToken: user.fcmToken.substring(0, 20) + '...',
        };
    }

    @Post('broadcast-test')
    @ApiOperation({ summary: 'Test: Broadcast notification to all users' })
    async broadcastTest(@Body() body: { title: string; message: string }) {
        return this.notificationsService.broadcast(body);
    }
}
