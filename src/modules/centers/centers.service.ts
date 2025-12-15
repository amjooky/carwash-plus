import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCenterDto } from './dto/create-center.dto';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { generateSecurePassword, generateUsernameFromEmail } from '../../common/utils/password.util';

@Injectable()
export class CentersService {
  constructor(private prisma: PrismaService) { }

  async findAll(user?: any) {
    if (user && user.role === 'ADMIN') {
      // Return only the center owned by this admin
      return this.prisma.center.findMany({ where: { ownerId: user.id } });
    }
    return this.prisma.center.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string, user?: any) {
    if (user && user.role === 'ADMIN') {
      // Ensure the admin owns this center
      const owns = await this.prisma.center.count({ where: { id, ownerId: user.id } });
      if (owns === 0) return null;
    }
    return this.prisma.center.findUnique({
      where: { id },
      include: { services: true, staff: true, owner: true },
    });
  }

  async create(dto: CreateCenterDto) {
    // Extract owner fields
    const { createOwner, ownerEmail, ownerFirstName, ownerLastName, ownerUsername, ...centerData } = dto;

    // If createOwner is true, validate required fields
    if (createOwner) {
      if (!ownerEmail) {
        throw new BadRequestException('Owner email is required when creating an owner account');
      }

      // Check if user with this email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: ownerEmail },
      });

      if (existingUser) {
        throw new ConflictException('A user with this email already exists');
      }

      // Generate username if not provided
      const username = ownerUsername || generateUsernameFromEmail(ownerEmail);

      // Check if username is taken
      const existingUsername = await this.prisma.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        throw new ConflictException('This username is already taken. Please provide a custom username.');
      }

      // Generate secure password
      const generatedPassword = generateSecurePassword(12);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      // Create user and center in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create the owner user
        const owner = await tx.user.create({
          data: {
            email: ownerEmail,
            username,
            password: hashedPassword,
            firstName: ownerFirstName || '',
            lastName: ownerLastName || '',
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
          },
        });

        // Create the center with owner link
        const center = await tx.center.create({
          data: {
            ...centerData,
            isActive: centerData.isActive ?? true,
            ownerId: owner.id,
          },
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        });

        return { center, owner, generatedPassword };
      });

      // Return center with credentials
      return {
        center: result.center,
        ownerCredentials: {
          email: result.owner.email,
          username: result.owner.username,
          password: result.generatedPassword,
          firstName: result.owner.firstName,
          lastName: result.owner.lastName,
          message: 'IMPORTANT: Save these credentials securely. The password will not be shown again.',
        },
      };
    } else {
      // Create center without owner (existing behavior)
      const center = await this.prisma.center.create({
        data: {
          ...centerData,
          isActive: centerData.isActive ?? true,
        },
      });

      return { center };
    }
  }

  async update(id: string, data: any) {
    return this.prisma.center.update({ where: { id }, data });
  }

  async findByOwner(ownerId: string) {
    return this.prisma.center.findFirst({ where: { ownerId } });
  }

  async canUserEditCenter(userId: string, centerId: string) {
    const count = await this.prisma.center.count({ where: { id: centerId, ownerId: userId } });
    return count > 0;
  }

  async getAvailability(centerId: string, date: string) {
    const center = await this.prisma.center.findUnique({
      where: { id: centerId },
    });

    if (!center) throw new NotFoundException('Center not found');

    // Parse date range for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all active bookings for this center and date
    const bookings = await this.prisma.booking.findMany({
      where: {
        centerId,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ['CANCELLED', 'NO_SHOW'] as any,
        }
      },
      select: {
        scheduledTime: true,
        estimatedDuration: true,
        bayNumber: true,
      } as any
    });

    // Generate time slots based on open/close time and interval
    const slots: any[] = [];
    const interval = center.timeSlotInterval || 30;

    // Parse open/close times (assuming HH:mm format)
    const [openHour, openMin] = center.openTime.split(':').map(Number);
    const [closeHour, closeMin] = center.closeTime.split(':').map(Number);

    let currentHour = openHour;
    let currentMin = openMin;

    // Loop until we reach close time
    while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

      // Find bookings active at this time
      const bookingsAtSlot = bookings.filter((b: any) => {
        const slotTimeMins = currentHour * 60 + currentMin;
        const [bHour, bMin] = b.scheduledTime.split(':').map(Number);
        const bookingStartMins = bHour * 60 + bMin;
        // Booking duration is estimatedDuration (which might be null if not selected?)
        // Assuming duration is valid. if missing default to 30.
        const duration = b.estimatedDuration || 30;
        const bookingEndMins = bookingStartMins + duration;

        // Check if slot overlaps with booking
        // Overlap if: slotStart < bookingEnd AND slotEnd > bookingStart
        // Here slot has size 'interval'.
        const slotEndMins = slotTimeMins + interval;

        return slotTimeMins < bookingEndMins && slotEndMins > bookingStartMins;
      });

      // Determine occupied bays
      const occupiedBays = bookingsAtSlot
        .map((b: any) => b.bayNumber)
        .filter((n: any) => n !== null); // Filter nulls

      // Calculate available bays (1 to capacity)
      const allBays = Array.from({ length: center.capacity }, (_, i) => i + 1);
      const availableBays = allBays.filter(bay => !occupiedBays.includes(bay));

      // Status
      let status = 'AVAILABLE';
      if (availableBays.length === 0) status = 'FULL';
      else if (availableBays.length <= 2) status = 'LIMITED';

      slots.push({
        time: timeString,
        status,
        bays: availableBays,
        totalCapacity: center.capacity,
        availableCount: availableBays.length,
      });

      // Increment time
      currentMin += interval;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }

    return {
      date,
      centerId,
      slots,
    };
  }

  async getAvailableBays(centerId: string, date: string, time: string) {
    const availability = await this.getAvailability(centerId, date);
    const slot = availability.slots.find(s => s.time === time);
    return slot ? slot.bays : [];
  }
}
