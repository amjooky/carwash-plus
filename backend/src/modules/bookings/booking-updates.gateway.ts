import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true, namespace: '/bookings' })
export class BookingUpdatesGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('BookingUpdatesGateway');

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('subscribe-booking')
    handleSubscribe(client: Socket, bookingId: string) {
        client.join(`booking-${bookingId}`);
        this.logger.log(`Client ${client.id} subscribed to booking ${bookingId}`);
        return { event: 'subscribed', data: { bookingId } };
    }

    @SubscribeMessage('unsubscribe-booking')
    handleUnsubscribe(client: Socket, bookingId: string) {
        client.leave(`booking-${bookingId}`);
        this.logger.log(`Client ${client.id} unsubscribed from booking ${bookingId}`);
    }

    // Call this method when booking status changes
    sendBookingUpdate(bookingId: string, status: any) {
        this.server.to(`booking-${bookingId}`).emit('booking-update', status);
        this.logger.log(`Sent update for booking ${bookingId}: ${status.status}`);
    }

    // Broadcast to all connected clients
    broadcastUpdate(message: any) {
        this.server.emit('broadcast', message);
    }
}
