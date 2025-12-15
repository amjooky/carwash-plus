import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AvailabilityService {
    constructor(private prisma: PrismaService) { }

    /**
     * Generate time slots based on center configuration
     */
    generateTimeSlots(openTime: string, closeTime: string, interval: number): string[] {
        const slots: string[] = [];

        const [openHour, openMin] = openTime.split(':').map(Number);
        const [closeHour, closeMin] = closeTime.split(':').map(Number);

        let currentMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;

        while (currentMinutes < closeMinutes) {
            const hours = Math.floor(currentMinutes / 60);
            const minutes = currentMinutes % 60;
            slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
            currentMinutes += interval;
        }

        return slots;
    }

    /**
     * Get availability for a specific center and date with bay-level details
     */
    async getAvailability(centerId: string, date: Date) {
        const center = await this.prisma.center.findUnique({
            where: { id: centerId },
            select: {
                id: true,
                name: true,
                capacity: true,
                timeSlotInterval: true,
                openTime: true,
                closeTime: true,
            },
        });

        if (!center) {
            throw new BadRequestException('Center not found');
        }

        // Generate all possible time slots
        const timeSlots = this.generateTimeSlots(
            center.openTime,
            center.closeTime,
            center.timeSlotInterval,
        );

        // Get all bookings for this date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await this.prisma.booking.findMany({
            where: {
                centerId,
                scheduledDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: {
                    in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
                },
            },
            select: {
                id: true,
                scheduledTime: true,
                bayNumber: true,
                status: true,
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                vehicle: {
                    select: {
                        make: true,
                        model: true,
                        licensePlate: true,
                    },
                },
            },
        });

        // Build bay-level availability for each slot
        const slots = timeSlots.map((time) => {
            const timeBookings = bookings.filter((b) => b.scheduledTime === time);
            const bays: Array<{
                bayNumber: number;
                isAvailable: boolean;
                booking: {
                    id: string;
                    customerName: string;
                    vehicle: string;
                    licensePlate: string;
                    status: any;
                } | null;
            }> = [];

            // Generate status for each bay (1 to capacity)
            for (let bayNum = 1; bayNum <= center.capacity; bayNum++) {
                const booking = timeBookings.find((b) => b.bayNumber === bayNum);

                bays.push({
                    bayNumber: bayNum,
                    isAvailable: !booking,
                    booking: booking
                        ? {
                            id: booking.id,
                            customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
                            vehicle: `${booking.vehicle.make} ${booking.vehicle.model}`,
                            licensePlate: booking.vehicle.licensePlate,
                            status: booking.status,
                        }
                        : null,
                });
            }

            const availableCount = bays.filter((b) => b.isAvailable).length;

            return {
                time,
                capacity: center.capacity,
                bays,
                availableCount,
                isAvailable: availableCount > 0,
            };
        });

        return {
            date,
            center,
            slots,
        };
    }

    /**
     * Check if a specific time slot is available
     */
    async checkSlotAvailability(
        centerId: string,
        date: Date,
        time: string,
    ): Promise<{ isAvailable: boolean; available: number; capacity: number }> {
        const center = await this.prisma.center.findUnique({
            where: { id: centerId },
            select: { capacity: true },
        });

        if (!center) {
            throw new BadRequestException('Center not found');
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookingCount = await this.prisma.booking.count({
            where: {
                centerId,
                scheduledDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                scheduledTime: time,
                status: {
                    in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
                },
            },
        });

        const available = center.capacity - bookingCount;

        return {
            isAvailable: available > 0,
            available,
            capacity: center.capacity,
        };
    }

    /**
     * Get available bay numbers for a specific time slot
     */
    async getAvailableBays(
        centerId: string,
        date: Date,
        time: string,
    ): Promise<number[]> {
        const center = await this.prisma.center.findUnique({
            where: { id: centerId },
            select: { capacity: true },
        });

        if (!center) {
            throw new BadRequestException('Center not found');
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookedBays = await this.prisma.booking.findMany({
            where: {
                centerId,
                scheduledDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                scheduledTime: time,
                status: {
                    in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
                },
                bayNumber: { not: null },
            },
            select: { bayNumber: true },
        });

        const bookedBayNumbers = bookedBays.map((b) => b.bayNumber).filter((n): n is number => n !== null);
        const availableBays: number[] = [];

        for (let i = 1; i <= center.capacity; i++) {
            if (!bookedBayNumbers.includes(i)) {
                availableBays.push(i);
            }
        }

        return availableBays;
    }
}
