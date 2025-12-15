import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.service.findMany({
      include: {
        center: true,
        pricing: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.service.findUnique({
      where: { id },
      include: {
        center: true,
        pricing: true,
      },
    });
  }

  async findByCenter(centerId: string) {
    return this.prisma.service.findMany({
      where: { 
        centerId,
        isActive: true,
      },
      include: {
        pricing: true,
      },
    });
  }

  async create(createServiceDto: CreateServiceDto) {
    const { centerId, pricing, ...serviceData } = createServiceDto;

    // Verify center exists
    const center = await this.prisma.center.findUnique({
      where: { id: centerId },
    });

    if (!center) {
      throw new NotFoundException('Center not found');
    }

    // Create service with pricing
    return this.prisma.service.create({
      data: {
        ...serviceData,
        centerId,
        pricing: {
          create: pricing.map(p => ({
            vehicleType: p.vehicleType,
            basePrice: p.basePrice,
          })),
        },
      },
      include: {
        center: true,
        pricing: true,
      },
    });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { pricing: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const { pricing, ...serviceData } = updateServiceDto;

    // If pricing is provided, delete old pricing and create new ones
    if (pricing) {
      await this.prisma.servicePricing.deleteMany({
        where: { serviceId: id },
      });
    }

    return this.prisma.service.update({
      where: { id },
      data: {
        ...serviceData,
        ...(pricing && {
          pricing: {
            create: pricing.map(p => ({
              vehicleType: p.vehicleType,
              basePrice: p.basePrice,
            })),
          },
        }),
      },
      include: {
        center: true,
        pricing: true,
      },
    });
  }

  async remove(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Delete associated pricing first
    await this.prisma.servicePricing.deleteMany({
      where: { serviceId: id },
    });

    // Delete the service
    await this.prisma.service.delete({
      where: { id },
    });

    return { message: 'Service deleted successfully' };
  }
}
