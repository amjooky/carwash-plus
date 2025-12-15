import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBookingDto, BulkBookingDto, AssignStaffDto } from './dto/create-booking.dto';
import { UpdateBookingDto, UpdateBookingStatusDto } from './dto/update-booking.dto';
import { BookingStatus, PaymentStatus, NotificationType } from '@prisma/client';
import { NotificationsService } from '../../modules/notifications/notifications.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) { }

  async create(createBookingDto: CreateBookingDto) {
    // Get center details
    const center = await this.prisma.center.findUnique({
      where: { id: createBookingDto.centerId },
      select: { capacity: true },
    });

    if (!center) {
      throw new NotFoundException('Center not found');
    }

    const scheduledDate = new Date(createBookingDto.scheduledDate);
    const startOfDay = new Date(scheduledDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(scheduledDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check for existing booking for this vehicle at the same time
    const existingVehicleBooking = await this.prisma.booking.findFirst({
      where: {
        vehicleId: createBookingDto.vehicleId,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        scheduledTime: createBookingDto.scheduledTime,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
        },
      },
    });

    if (existingVehicleBooking) {
      throw new BadRequestException('This vehicle is already booked for a service at this time.');
    }

    // Bay assignment logic
    let assignedBay: number;

    if (createBookingDto.bayNumber) {
      // Manual bay selection - validate bay number
      if (createBookingDto.bayNumber < 1 || createBookingDto.bayNumber > center.capacity) {
        throw new BadRequestException(`Bay number must be between 1 and ${center.capacity}`);
      }

      // Check if bay is already booked
      const existingBooking = await this.prisma.booking.findFirst({
        where: {
          centerId: createBookingDto.centerId,
          scheduledDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          scheduledTime: createBookingDto.scheduledTime,
          bayNumber: createBookingDto.bayNumber,
          status: {
            in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
          },
        },
      });

      if (existingBooking) {
        throw new BadRequestException(`Bay ${createBookingDto.bayNumber} is already booked for this time slot`);
      }

      assignedBay = createBookingDto.bayNumber;
    } else {
      // Auto-assign first available bay
      const bookedBays = await this.prisma.booking.findMany({
        where: {
          centerId: createBookingDto.centerId,
          scheduledDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          scheduledTime: createBookingDto.scheduledTime,
          status: {
            in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
          },
          bayNumber: { not: null },
        },
        select: { bayNumber: true },
      });

      const bookedBayNumbers = bookedBays.map((b) => b.bayNumber).filter((n): n is number => n !== null);

      // Find first available bay
      let foundBay: number | null = null;
      for (let i = 1; i <= center.capacity; i++) {
        if (!bookedBayNumbers.includes(i)) {
          foundBay = i;
          break;
        }
      }

      if (!foundBay) {
        throw new BadRequestException('All bays are fully booked for this time slot. Please choose another time.');
      }

      assignedBay = foundBay;
    }

    // Get vehicle to determine type for pricing
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: createBookingDto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Calculate total amount and duration
    let totalAmount = 0;
    let totalDuration = 0;
    const serviceDetails: Array<{ serviceId: string; price: number; duration: number }> = [];

    for (const serviceId of createBookingDto.serviceIds) {
      const service = await this.prisma.service.findUnique({
        where: { id: serviceId },
        include: {
          pricing: {
            where: {
              vehicleType: vehicle.type,
              isActive: true,
            },
            orderBy: { validFrom: 'desc' },
            take: 1,
          },
        },
      });

      if (!service || service.pricing.length === 0) {
        throw new BadRequestException(`Pricing not found for service ${serviceId}`);
      }

      const pricing = service.pricing[0];
      const price = pricing.basePrice * (1 - pricing.discount / 100);

      totalAmount += price;
      totalDuration += service.baseDuration;

      serviceDetails.push({
        serviceId,
        price,
        duration: service.baseDuration,
      });
    }

    // Generate booking number
    const bookingNumber = await this.generateBookingNumber();

    // Create booking (scheduledDate already defined above)
    const booking = await this.prisma.booking.create({
      data: {
        centerId: createBookingDto.centerId,
        customerId: createBookingDto.customerId,
        vehicleId: createBookingDto.vehicleId,
        bookingNumber,
        scheduledDate,
        scheduledTime: createBookingDto.scheduledTime,
        bayNumber: assignedBay,
        estimatedDuration: totalDuration,
        totalAmount,
        finalAmount: totalAmount,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        notes: createBookingDto.notes,
        isRecurring: createBookingDto.isRecurring || false,
        recurringPattern: createBookingDto.recurringPattern,
        recurringEndDate: createBookingDto.recurringEndDate ? new Date(createBookingDto.recurringEndDate) : undefined,
        templateId: createBookingDto.templateId,
        services: {
          create: serviceDetails,
        },
      },
      include: {
        customer: true,
        vehicle: true,
        center: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    // Assign staff if provided
    if (createBookingDto.staffId) {
      await this.prisma.bookingAssignment.create({
        data: {
          bookingId: booking.id,
          staffId: createBookingDto.staffId,
        },
      });
    }

    // Update customer stats
    await this.prisma.customer.update({
      where: { id: createBookingDto.customerId },
      data: {
        totalBookings: { increment: 1 },
      },
    });

    // Get customer's userId for notification
    const customer = await this.prisma.customer.findUnique({
      where: { id: createBookingDto.customerId },
      select: { userId: true },
    });

    // Create notification if customer has a user account
    if (customer?.userId) {
      await this.prisma.notification.create({
        data: {
          userId: customer.userId,
          type: NotificationType.BOOKING_CONFIRMATION,
          title: 'Booking Confirmed',
          message: `Your booking ${bookingNumber} has been confirmed for ${scheduledDate.toDateString()} at ${createBookingDto.scheduledTime}`,
          data: { bookingId: booking.id },
        },
      });
    }

    return booking;
  }

  async createBulk(bulkBookingDto: BulkBookingDto) {
    const results: Array<{ success: boolean; booking?: any; error?: string }> = [];
    for (const bookingDto of bulkBookingDto.bookings) {
      try {
        const booking = await this.create(bookingDto);
        results.push({ success: true, booking });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    return results;
  }

  async findAll(filters?: {
    centerId?: string;
    customerId?: string;
    status?: BookingStatus;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.centerId) where.centerId = filters.centerId;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.status) where.status = filters.status;
    if (filters?.dateFrom || filters?.dateTo) {
      where.scheduledDate = {};
      if (filters.dateFrom) where.scheduledDate.gte = filters.dateFrom;
      if (filters.dateTo) where.scheduledDate.lte = filters.dateTo;
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          customer: true,
          vehicle: true,
          center: true,
          services: {
            include: {
              service: true,
            },
          },
          assignments: {
            include: {
              staff: true,
            },
          },
        },
        orderBy: {
          scheduledDate: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        center: true,
        services: {
          include: {
            service: true,
          },
        },
        assignments: {
          include: {
            staff: true,
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    await this.findOne(id); // Check exists

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        customer: true,
        vehicle: true,
        center: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateBookingStatusDto) {
    const booking = await this.findOne(id);

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        cancelReason: updateStatusDto.cancelReason,
        actualStartTime: updateStatusDto.status === BookingStatus.IN_PROGRESS ? new Date() : booking.actualStartTime,
        actualEndTime: updateStatusDto.status === BookingStatus.COMPLETED ? new Date() : booking.actualEndTime,
      },
      include: {
        customer: true,
        assignments: {
          include: {
            staff: true,
          },
        },
      },
    });

    // Handle completed bookings
    if (updateStatusDto.status === BookingStatus.COMPLETED) {
      // Award loyalty points
      const pointsEarned = Math.floor(booking.finalAmount / 10); // 10% back as points
      await this.prisma.customer.update({
        where: { id: booking.customerId },
        data: {
          loyaltyPoints: { increment: pointsEarned },
          totalSpent: { increment: booking.finalAmount },
        },
      });

      await this.prisma.loyaltyHistory.create({
        data: {
          customerId: booking.customerId,
          points: pointsEarned,
          reason: 'Booking completed',
          description: `Earned ${pointsEarned} points for booking ${booking.bookingNumber}`,
          bookingId: booking.id,
        },
      });

      // Update staff completion stats
      for (const assignment of updatedBooking.assignments) {
        await this.prisma.staff.update({
          where: { id: assignment.staffId },
          data: {
            completedJobs: { increment: 1 },
          },
        });
      }

      // Get customer's userId for notification - relying on updatedBooking include
    }

    // Generic notification for all status changes
    // We already included customer in updatedBooking query
    if (updatedBooking.customer && updatedBooking.customer.userId) {
      await this.notificationsService.createBookingStatusNotification(
        updatedBooking.customer.userId,
        updatedBooking.id,
        updatedBooking.bookingNumber,
        updateStatusDto.status
      );
    }

    return updatedBooking;
  }



  async cancel(id: string, reason?: string) {
    return this.updateStatus(id, {
      status: BookingStatus.CANCELLED,
      cancelReason: reason,
    });
  }

  async assignStaff(id: string, assignStaffDto: AssignStaffDto) {
    await this.findOne(id);

    // Remove existing assignments
    await this.prisma.bookingAssignment.deleteMany({
      where: { bookingId: id },
    });

    // Create new assignments
    const assignments = await Promise.all(
      assignStaffDto.staffIds.map((staffId) =>
        this.prisma.bookingAssignment.create({
          data: {
            bookingId: id,
            staffId,
          },
          include: {
            staff: true,
          },
        }),
      ),
    );

    // Update staff total jobs
    for (const staffId of assignStaffDto.staffIds) {
      await this.prisma.staff.update({
        where: { id: staffId },
        data: {
          totalJobs: { increment: 1 },
        },
      });
    }

    return assignments;
  }

  async getOrCreateCustomer(userId: string, userData: any) {
    // Check if customer record exists for this user
    let customer = await this.prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Create customer record
      customer = await this.prisma.customer.create({
        data: {
          userId: user.id,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          phone: user.phone || '',
        },
      });
    }

    return customer;
  }

  private async generateBookingNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

    const count = await this.prisma.booking.count({
      where: {
        bookingNumber: {
          startsWith: `BK-${dateStr}`,
        },
      },
    });

    return `BK-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
}
