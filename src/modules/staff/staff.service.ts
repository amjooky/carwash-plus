import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ShiftStatus } from '@prisma/client';
import { CreateStaffDto, UpdateStaffDto, CreateShiftDto } from './dto/staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(createStaffDto: CreateStaffDto) {
    return this.prisma.staff.create({
      data: createStaffDto,
      include: {
        center: true,
        badges: true,
      },
    });
  }

  async findAll(centerId?: string, isActive?: boolean, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (centerId) where.centerId = centerId;
    if (isActive !== undefined) where.isActive = isActive;

    const [staff, total] = await Promise.all([
      this.prisma.staff.findMany({
        where,
        include: {
          center: true,
          badges: true,
          _count: {
            select: {
              assignments: true,
              shifts: true,
            },
          },
        },
        orderBy: {
          rating: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.staff.count({ where }),
    ]);

    return {
      data: staff,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      include: {
        center: true,
        shifts: {
          orderBy: {
            date: 'desc',
          },
          take: 10,
        },
        assignments: {
          include: {
            booking: {
              include: {
                customer: true,
                vehicle: true,
              },
            },
          },
          orderBy: {
            assignedAt: 'desc',
          },
          take: 10,
        },
        badges: {
          orderBy: {
            earnedAt: 'desc',
          },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    return staff;
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    await this.findOne(id);

    return this.prisma.staff.update({
      where: { id },
      data: updateStaffDto,
      include: {
        center: true,
        badges: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.staff.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getPerformance(id: string) {
    const staff = await this.findOne(id);

    const completionRate = staff.totalJobs > 0 ? (staff.completedJobs / staff.totalJobs) * 100 : 0;

    const recentAssignments = await this.prisma.bookingAssignment.findMany({
      where: {
        staffId: id,
        booking: {
          status: 'COMPLETED',
        },
      },
      include: {
        booking: true,
      },
      orderBy: {
        assignedAt: 'desc',
      },
      take: 20,
    });

    return {
      id: staff.id,
      name: `${staff.firstName} ${staff.lastName}`,
      role: staff.role,
      rating: staff.rating,
      totalJobs: staff.totalJobs,
      completedJobs: staff.completedJobs,
      completionRate,
      badges: staff.badges,
      recentJobs: recentAssignments,
    };
  }

  async getSchedule(id: string, dateFrom?: Date, dateTo?: Date) {
    await this.findOne(id);

    const where: any = { staffId: id };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    return this.prisma.shift.findMany({
      where,
      orderBy: {
        date: 'asc',
      },
    });
  }

  async createShift(id: string, createShiftDto: CreateShiftDto) {
    await this.findOne(id);

    return this.prisma.shift.create({
      data: {
        staffId: id,
        ...createShiftDto,
        status: ShiftStatus.SCHEDULED,
      },
    });
  }

  async getLeaderboard(limit: number = 10) {
    return this.prisma.staff.findMany({
      where: {
        isActive: true,
      },
      take: limit,
      orderBy: {
        rating: 'desc',
      },
      include: {
        center: true,
        badges: true,
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });
  }
}
