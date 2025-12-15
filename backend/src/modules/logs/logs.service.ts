import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { QueryLogDto } from './dto/log.dto';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryLogDto) {
    const { page = 1, limit = 20, level, action, module, userId, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (level) where.level = level;
    if (action) where.action = action;
    if (module) where.module = module;
    if (userId) where.userId = userId;
    if (search) {
      where.message = { contains: search, mode: 'insensitive' };
    }

    const [logs, total] = await Promise.all([
      this.prisma.log.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.log.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.log.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getStats() {
    const [total, byLevel, byAction, byModule, recent] = await Promise.all([
      this.prisma.log.count(),
      this.prisma.log.groupBy({
        by: ['level'],
        _count: true,
      }),
      this.prisma.log.groupBy({
        by: ['action'],
        _count: true,
      }),
      this.prisma.log.groupBy({
        by: ['module'],
        _count: true,
      }),
      this.prisma.log.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      byLevel: byLevel.map((item) => ({
        level: item.level,
        count: item._count,
      })),
      byAction: byAction.map((item) => ({
        action: item.action,
        count: item._count,
      })),
      byModule: byModule.map((item) => ({
        module: item.module,
        count: item._count,
      })),
      recent,
    };
  }

  async deleteOld(days: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await this.prisma.log.deleteMany({
      where: {
        createdAt: {
          lt: date,
        },
      },
    });

    return { deleted: result.count };
  }
}
