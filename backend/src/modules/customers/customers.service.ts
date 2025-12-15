import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, AddVehicleDto, AddLoyaltyPointsDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) { }

  async create(createCustomerDto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { email: createCustomerDto.email },
    });

    if (existing) {
      throw new ConflictException('Customer with this email already exists');
    }

    return this.prisma.customer.create({
      data: createCustomerDto,
      include: {
        vehicles: true,
        badges: true,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 20, search?: string, centerId?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (centerId) {
      where.bookings = {
        some: {
          centerId,
        },
      };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          vehicles: true,
          badges: true,
          _count: {
            select: {
              bookings: true,
            },
          },
        },
        orderBy: {
          loyaltyPoints: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: true,
        bookings: {
          include: {
            center: true,
            services: {
              include: {
                service: true,
              },
            },
          },
          orderBy: {
            scheduledDate: 'desc',
          },
          take: 10,
        },
        loyaltyHistory: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 20,
        },
        badges: {
          orderBy: {
            earnedAt: 'desc',
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    await this.findOne(id);

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
      include: {
        vehicles: true,
        badges: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.customer.delete({ where: { id } });
  }

  async getBookingHistory(id: string, page: number = 1, limit: number = 10) {
    await this.findOne(id);

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: { customerId: id },
        include: {
          center: true,
          vehicle: true,
          services: {
            include: {
              service: true,
            },
          },
        },
        orderBy: {
          scheduledDate: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where: { customerId: id } }),
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

  async getLoyaltyInfo(id: string) {
    const customer = await this.findOne(id);

    const history = await this.prisma.loyaltyHistory.findMany({
      where: { customerId: id },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return {
      currentPoints: customer.loyaltyPoints,
      totalEarned: history
        .filter((h) => h.points > 0)
        .reduce((sum, h) => sum + h.points, 0),
      totalRedeemed: history
        .filter((h) => h.points < 0)
        .reduce((sum, h) => sum + Math.abs(h.points), 0),
      history,
      badges: customer.badges,
    };
  }

  async addLoyaltyPoints(id: string, addPointsDto: AddLoyaltyPointsDto) {
    await this.findOne(id);

    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        loyaltyPoints: { increment: addPointsDto.points },
      },
    });

    await this.prisma.loyaltyHistory.create({
      data: {
        customerId: id,
        points: addPointsDto.points,
        reason: addPointsDto.reason,
        description: addPointsDto.description,
      },
    });

    return customer;
  }

  async getVehicles(id: string) {
    await this.findOne(id);

    return this.prisma.vehicle.findMany({
      where: { customerId: id },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async addVehicle(id: string, addVehicleDto: AddVehicleDto) {
    await this.findOne(id);

    return this.prisma.vehicle.create({
      data: {
        customerId: id,
        ...addVehicleDto,
      },
    });
  }

  async deleteVehicle(customerId: string, vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.customerId !== customerId) {
      throw new NotFoundException('Vehicle does not belong to this customer');
    }

    await this.prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return { message: 'Vehicle deleted successfully' };
  }

  async getLeaderboard(limit: number = 10) {
    return this.prisma.customer.findMany({
      take: limit,
      orderBy: {
        loyaltyPoints: 'desc',
      },
      include: {
        badges: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });
  }
}
