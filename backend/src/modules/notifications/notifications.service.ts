import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FirebaseService } from '../../common/firebase/firebase.service';
import { CreateNotificationDto, BroadcastNotificationDto } from './dto/notification.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        private firebaseService: FirebaseService,
    ) { }

    // Get user's notifications
    async findUserNotifications(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                booking: {
                    select: {
                        id: true,
                        bookingNumber: true,
                        status: true,
                    },
                },
            },
        });
    }

    // Create a notification
    async create(dto: CreateNotificationDto) {
        return this.prisma.notification.create({
            data: dto,
        });
    }

    // Broadcast promotional notification to all users
    async broadcast(dto: BroadcastNotificationDto) {
        // Get all active users
        const users = await this.prisma.user.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true },
        });

        // Create notification for each user
        const notifications = await Promise.all(
            users.map((user) =>
                this.prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: NotificationType.PROMOTIONAL,
                        title: dto.title,
                        message: dto.message,
                    },
                }),
            ),
        );

        // Send push notifications to users with FCM tokens
        const usersWithTokens = await this.prisma.user.findMany({
            where: {
                status: 'ACTIVE',
                fcmToken: { not: null },
            },
            select: { fcmToken: true },
        });

        const tokens = usersWithTokens
            .map(u => u.fcmToken)
            .filter(t => t !== null) as string[];

        if (tokens.length > 0) {
            const failedTokens = await this.firebaseService.sendPushToMultipleTokens(
                tokens,
                dto.title,
                dto.message,
                { type: 'PROMOTIONAL' },
            );

            // Clean up invalid tokens
            if (failedTokens && failedTokens.length > 0) {
                console.log(`🧹 Removing ${failedTokens.length} invalid FCM tokens from database`);
                await this.prisma.user.updateMany({
                    where: { fcmToken: { in: failedTokens } },
                    data: { fcmToken: null },
                });
            }
        }

        return {
            success: true,
            count: notifications.length,
            message: `Notification sent to ${notifications.length} users`,
        };
    }

    // Create booking status notification
    async createBookingStatusNotification(
        userId: string,
        bookingId: string,
        bookingNumber: string,
        status: string,
    ) {
        const statusMessages = {
            CONFIRMED: {
                title: 'Booking Confirmed',
                message: `Your booking ${bookingNumber} has been confirmed!`,
            },
            IN_PROGRESS: {
                title: 'Car Wash In Progress',
                message: `Your car wash is now in progress!`,
            },
            COMPLETED: {
                title: 'Booking Completed',
                message: `Your booking ${bookingNumber} is complete. Thank you!`,
            },
            CANCELLED: {
                title: 'Booking Cancelled',
                message: `Your booking ${bookingNumber} has been cancelled.`,
            },
        };

        const notification = statusMessages[status];
        if (!notification) return null;

        const createdNotification = await this.prisma.notification.create({
            data: {
                userId,
                bookingId,
                type: NotificationType.BOOKING_STATUS,
                title: notification.title,
                message: notification.message,
                data: { bookingNumber, status },
            },
        });

        // Send push notification if user has FCM token
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { fcmToken: true },
        });

        if (user?.fcmToken) {
            await this.firebaseService.sendPushNotification(
                user.fcmToken,
                notification.title,
                notification.message,
                { bookingId, bookingNumber, status, type: 'BOOKING_STATUS' },
            );
        }

        return createdNotification;
    }

    // Mark as read
    async markAsRead(id: string, userId: string) {
        return this.prisma.notification.update({
            where: { id, userId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    // Delete notification
    async delete(id: string, userId: string) {
        return this.prisma.notification.delete({
            where: { id, userId },
        });
    }

    // Get all notifications (admin)
    async findAll() {
        return this.prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            take: 100,
        });
    }
}
