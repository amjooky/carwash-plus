import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      usersByRole,
      usersByStatus,
      recentActivity,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { status: UserStatus.ACTIVE },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.user.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.log.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              username: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    // Get user growth for last 30 days
    const userGrowth = await this.getUserGrowth(30);

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      inactiveUsers: totalUsers - activeUsers,
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
      usersByStatus: usersByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      userGrowth,
      recentActivity,
    };
  }

  async getUserGrowth(days: number = 30) {
    const result: { date: string; count: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const count = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      result.push({
        date: startOfDay.toISOString().split('T')[0],
        count,
      });
    }

    return result;
  }

  async getUserStats() {
    const [total, byRole, byStatus, loginActivity] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.user.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.user.findMany({
        take: 10,
        where: {
          lastLogin: {
            not: null,
          },
        },
        orderBy: { lastLogin: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          lastLogin: true,
          avatar: true,
        },
      }),
    ]);

    return {
      total,
      byRole: byRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      recentLogins: loginActivity,
    };
  }

  async getActivityStats(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [logs, logsByAction, logsByLevel] = await Promise.all([
      this.prisma.log.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),
      this.prisma.log.groupBy({
        by: ['action'],
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _count: true,
      }),
      this.prisma.log.groupBy({
        by: ['level'],
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _count: true,
      }),
    ]);

    return {
      totalLogs: logs,
      byAction: logsByAction.map((item) => ({
        action: item.action,
        count: item._count,
      })),
      byLevel: logsByLevel.map((item) => ({
        level: item.level,
        count: item._count,
      })),
    };
  }
}
