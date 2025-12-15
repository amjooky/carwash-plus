import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto/user.dto';
import { UserRole, LogLevel, LogAction, VehicleType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) { }

  async create(dto: CreateUserDto, createdById?: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      this.configService.get('BCRYPT_ROUNDS') || 10,
    );

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        createdById,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.createLog({
      userId: createdById,
      level: LogLevel.INFO,
      action: LogAction.CREATE,
      module: 'users',
      message: `User ${user.username} created`,
      metadata: { targetUserId: user.id },
    });

    return user;
  }

  async findAll(query: QueryUserDto) {
    const { page = 1, limit = 10, search, role, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      permissions: user.permissions.map((p) => p.permission),
    };
  }

  async update(id: string, dto: UpdateUserDto, updatedById?: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (dto.email || dto.username) {
      const duplicate = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                dto.email ? { email: dto.email } : {},
                dto.username ? { username: dto.username } : {},
              ],
            },
          ],
        },
      });

      if (duplicate) {
        throw new ConflictException('Email or username already exists');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.createLog({
      userId: updatedById,
      level: LogLevel.INFO,
      action: LogAction.UPDATE,
      module: 'users',
      message: `User ${user.username} updated`,
      metadata: { targetUserId: user.id, changes: dto },
    });

    return user;
  }

  async remove(id: string, deletedById?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });

    await this.createLog({
      userId: deletedById,
      level: LogLevel.WARN,
      action: LogAction.DELETE,
      module: 'users',
      message: `User ${user.username} deleted`,
      metadata: { targetUserId: id },
    });

    return { message: 'User deleted successfully' };
  }

  async updateStatus(id: string, status: string, updatedById?: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: status as any },
      select: {
        id: true,
        username: true,
        status: true,
      },
    });

    await this.createLog({
      userId: updatedById,
      level: LogLevel.INFO,
      action: LogAction.UPDATE,
      module: 'users',
      message: `User ${user.username} status changed to ${status}`,
      metadata: { targetUserId: id, newStatus: status },
    });

    return user;
  }

  async getMyVehicles(userId: string) {
    // Get or create customer for this user
    const customer = await this.getOrCreateCustomer(userId);

    return this.prisma.vehicle.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addMyVehicle(userId: string, vehicleDto: any) {
    // Get or create customer for this user
    const customer = await this.getOrCreateCustomer(userId);

    // Sanitize and validate vehicle data
    // Ensure we handle case mapping for enum (SEDAN vs Sedan)
    // And exclude fields not in schema (like trim)

    // Map type string to uppercase enum
    let vehicleType: VehicleType = VehicleType.SEDAN;
    const inputType = vehicleDto.type?.toString().toUpperCase() || 'SEDAN';

    // Check if valid enum
    if (Object.values(VehicleType).includes(inputType as VehicleType)) {
      vehicleType = inputType as VehicleType;
    }

    // License plate should be uppercase
    const licensePlate = (vehicleDto.licensePlate || '').toString().toUpperCase().trim();

    // Check for duplicate license plate
    const existing = await this.prisma.vehicle.findUnique({
      where: { licensePlate },
    });

    if (existing && existing.customerId === customer.id) {
      throw new ConflictException('You already have a vehicle with this license plate');
    }

    // Safely construct data object
    const vehicleData = {
      customerId: customer.id,
      make: vehicleDto.make || 'Unknown',
      model: vehicleDto.model || 'Unknown',
      year: parseInt(vehicleDto.year?.toString() || '2020'), // Ensure int
      color: vehicleDto.color || 'Unknown',
      licensePlate: licensePlate,
      type: vehicleType,
      // notes: vehicleDto.notes, // Check if notes exists in schema, otherwise exclude
    };

    return this.prisma.vehicle.create({
      data: vehicleData,
    });
  }

  async updateMyVehicle(userId: string, vehicleId: string, vehicleDto: any) {
    const customer = await this.getOrCreateCustomer(userId);

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.customerId !== customer.id) {
      throw new NotFoundException('Vehicle does not belong to you');
    }

    // Prepare update data
    const updateData: any = {};
    if (vehicleDto.make) updateData.make = vehicleDto.make;
    if (vehicleDto.model) updateData.model = vehicleDto.model;
    if (vehicleDto.year) updateData.year = parseInt(vehicleDto.year.toString());
    if (vehicleDto.color) updateData.color = vehicleDto.color;

    if (vehicleDto.type) {
      const inputType = vehicleDto.type.toString().toUpperCase();
      if (Object.values(VehicleType).includes(inputType as VehicleType)) {
        updateData.type = inputType as VehicleType;
      }
    }

    // Check for duplicate license plate if it's being changed
    if (vehicleDto.licensePlate) {
      const licensePlate = vehicleDto.licensePlate.toString().toUpperCase().trim();
      if (licensePlate !== vehicle.licensePlate) {
        const existing = await this.prisma.vehicle.findUnique({
          where: { licensePlate },
        });

        if (existing && existing.customerId === customer.id) {
          throw new ConflictException('You already have a vehicle with this license plate');
        }
        updateData.licensePlate = licensePlate;
      }
    }

    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
    });
  }

  async deleteMyVehicle(userId: string, vehicleId: string) {
    const customer = await this.getOrCreateCustomer(userId);

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.customerId !== customer.id) {
      throw new NotFoundException('Vehicle does not belong to you');
    }

    await this.prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return { message: 'Vehicle deleted successfully' };
  }

  private async getOrCreateCustomer(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if customer already exists for this user
    let customer = await this.prisma.customer.findUnique({
      where: { userId },
    });

    // Create customer if doesn't exist
    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          userId,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
        },
      });
    }

    return customer;
  }

  async updateFcmToken(userId: string, fcmToken: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
      select: {
        id: true,
        fcmToken: true,
      },
    });

    return { message: 'FCM token updated successfully', fcmToken: user.fcmToken };
  }

  private async createLog(data: {
    userId?: string;
    level: LogLevel;
    action: LogAction;
    module: string;
    message: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.prisma.log.create({
      data,
    });
  }
}
