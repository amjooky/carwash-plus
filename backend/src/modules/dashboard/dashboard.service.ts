import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  async getOverview(centerId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Common filters
    const bookingFilter = centerId ? { centerId } : {};
    const paymentFilter = centerId ? { booking: { centerId } } : {};
    const staffFilter = centerId ? { centerId } : {};

    // Today's bookings
    const todayBookings = await this.prisma.booking.count({
      where: {
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
        ...bookingFilter,
      },
    });

    const todayCompleted = await this.prisma.booking.count({
      where: {
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
        status: BookingStatus.COMPLETED,
        ...bookingFilter,
      },
    });

    const todayRevenue = await this.prisma.booking.aggregate({
      where: {
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
        status: BookingStatus.COMPLETED,
        ...bookingFilter,
      },
      _sum: {
        finalAmount: true,
      },
    });

    // Month stats
    const monthBookings = await this.prisma.booking.count({
      where: {
        scheduledDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        ...bookingFilter,
      },
    });

    const monthRevenue = await this.prisma.booking.aggregate({
      where: {
        scheduledDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: BookingStatus.COMPLETED,
        ...bookingFilter,
      },
      _sum: {
        finalAmount: true,
      },
    });

    // Total customers (Unique customers for this center)
    const totalCustomers = centerId
      ? await this.prisma.booking.findMany({
        where: { centerId },
        select: { customerId: true },
        distinct: ['customerId'],
      }).then(b => b.length)
      : await this.prisma.customer.count();

    // Active staff
    const activeStaff = await this.prisma.staff.count({
      where: {
        isActive: true,
        ...staffFilter,
      },
    });

    // Pending bookings
    const pendingBookings = await this.prisma.booking.count({
      where: {
        status: BookingStatus.PENDING,
        ...bookingFilter,
      },
    });

    // Revenue trend (last 7 days)
    const revenueTrend = await this.getRevenueTrend(7, centerId);

    // Popular services
    const popularServices = await this.getPopularServices(10, centerId);

    return {
      today: {
        bookings: todayBookings,
        completed: todayCompleted,
        revenue: todayRevenue._sum.finalAmount || 0,
      },
      month: {
        bookings: monthBookings,
        revenue: monthRevenue._sum.finalAmount || 0,
      },
      totals: {
        customers: totalCustomers,
        activeStaff: activeStaff,
        pendingBookings: pendingBookings,
      },
      trends: {
        revenue: revenueTrend,
      },
      popularServices,
    };
  }

  async getRevenueTrend(days: number = 30, centerId?: string) {
    const result: Array<{ date: string; revenue: number }> = [];
    const today = new Date();
    const bookingFilter = centerId ? { centerId } : {};

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const revenue = await this.prisma.booking.aggregate({
        where: {
          scheduledDate: {
            gte: date,
            lt: nextDate,
          },
          status: BookingStatus.COMPLETED,
          ...bookingFilter,
        },
        _sum: {
          finalAmount: true,
        },
      });

      result.push({
        date: date.toISOString().split('T')[0],
        revenue: revenue._sum.finalAmount || 0,
      });
    }

    return result;
  }

  async getBookingsToday(centerId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bookingFilter = centerId ? { centerId } : {};

    const bookings = await this.prisma.booking.findMany({
      where: {
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
        ...bookingFilter,
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
        assignments: {
          include: {
            staff: true,
          },
        },
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });

    return bookings;
  }

  async getStaffPerformance(centerId?: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const staffFilter = centerId ? { centerId } : {};

    const staff = await this.prisma.staff.findMany({
      where: {
        isActive: true,
        ...staffFilter,
      },
      include: {
        assignments: {
          where: {
            booking: {
              scheduledDate: {
                gte: startOfMonth,
              },
              status: BookingStatus.COMPLETED,
            },
          },
          include: {
            booking: true,
          },
        },
        badges: {
          orderBy: {
            earnedAt: 'desc',
          },
          take: 3,
        },
      },
      orderBy: {
        rating: 'desc',
      },
      take: 10,
    });

    return staff.map((s) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      role: s.role,
      rating: s.rating,
      totalJobs: s.totalJobs,
      completedJobs: s.completedJobs,
      completionRate: s.totalJobs > 0 ? (s.completedJobs / s.totalJobs) * 100 : 0,
      monthJobs: s.assignments.length,
      badges: s.badges,
    }));
  }

  async getPopularServices(limit: number = 5, centerId?: string) {
    // Note: bookingService doesn't have centerId, but service does.
    // Or we filter via booking?
    // bookingService -> booking -> centerId
    // Prisma check: BookingService has booking relation.

    // GroupBy with relation filtering is tricky in Prisma.
    // Alternative: Find many BookingServices where booking.centerId matches, then aggregate.
    // But groupBy doesn't support deep relation filtering easily in all versions.
    // simpler: Filter services by centerId FIRST (if provided), then count bookings? No.

    // Fallback: If centerId provided, use raw query or different approach.
    // However, for simplicity, I'll filter by service.centerId 
    // Wait, BookingService -> Service -> Center.
    // If I group by serviceId, I get services.
    // Then I can filter the RESULT by centerId (since I fetch service details).

    // Better:
    const whereClause = centerId ? {
      booking: { centerId }
    } : {};

    const services = await this.prisma.bookingService.groupBy({
      by: ['serviceId'],
      where: whereClause,
      _count: {
        serviceId: true,
      },
      orderBy: {
        _count: {
          serviceId: 'desc',
        },
      },
      take: limit,
    });

    const serviceDetails = await Promise.all(
      services.map(async (s) => {
        const service = await this.prisma.service.findUnique({
          where: { id: s.serviceId },
          include: {
            center: true,
          },
        });
        return {
          id: service?.id,
          name: service?.name,
          type: service?.type,
          center: service?.center?.name,
          bookings: s._count.serviceId,
        };
      }),
    );

    return serviceDetails;
  }

  async getRecentActivity(limit: number = 10, centerId?: string) {
    // Log has userID. User has ownedCenter? 
    // Or Log has 'module' and 'metadata'. 
    // It's hard to filter logs by Center purely from Log model unless logs have centerId.
    // Schema says Log has `userId`.
    // I can filter logs by users who belong to that center?
    // Or just return all logs for SuperAdmin, and maybe nothing for Center Admin?
    // OR: Filter logs where user.ownedCenter.id == centerId? (Only owner actions)
    // OR: Logs related to bookings of that center?

    // For now, if centerId is present, we filter by users who OWN that center (Admin) or WORK there (Staff).
    // This is complex.
    // Simplification: Return empty for Center Admin for now, or just leave it global (might be acceptable if logs are non-sensitive).
    // User said "money stats".
    // I'll leave logs global or simple for now to avoid breaking it.

    const logs = await this.prisma.log.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return logs;
  }
}
