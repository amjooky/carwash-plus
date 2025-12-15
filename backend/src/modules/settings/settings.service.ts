import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateSettingDto, UpdateSettingDto } from './dto/setting.dto';
import { LogLevel, LogAction } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    const where = category ? { category } : {};

    return this.prisma.setting.findMany({
      where,
      orderBy: { key: 'asc' },
    });
  }

  async findPublic() {
    return this.prisma.setting.findMany({
      where: { isPublic: true },
      select: {
        key: true,
        value: true,
        category: true,
        description: true,
      },
    });
  }

  async findOne(key: string) {
    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    return setting;
  }

  async create(dto: CreateSettingDto, userId?: string) {
    const setting = await this.prisma.setting.create({
      data: dto,
    });

    await this.createLog({
      userId,
      level: LogLevel.INFO,
      action: LogAction.CREATE,
      module: 'settings',
      message: `Setting ${setting.key} created`,
      metadata: { settingKey: setting.key },
    });

    return setting;
  }

  async update(key: string, dto: UpdateSettingDto, userId?: string) {
    const setting = await this.prisma.setting.update({
      where: { key },
      data: { value: dto.value },
    });

    await this.createLog({
      userId,
      level: LogLevel.INFO,
      action: LogAction.UPDATE,
      module: 'settings',
      message: `Setting ${key} updated`,
      metadata: { settingKey: key, newValue: dto.value },
    });

    return setting;
  }

  async remove(key: string, userId?: string) {
    await this.prisma.setting.delete({
      where: { key },
    });

    await this.createLog({
      userId,
      level: LogLevel.WARN,
      action: LogAction.DELETE,
      module: 'settings',
      message: `Setting ${key} deleted`,
      metadata: { settingKey: key },
    });

    return { message: 'Setting deleted successfully' };
  }

  async getByCategory(category: string) {
    return this.prisma.setting.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    });
  }

  private async createLog(data: {
    userId?: string;
    level: LogLevel;
    action: LogAction;
    module: string;
    message: string;
    metadata?: any;
  }) {
    await this.prisma.log.create({
      data,
    });
  }
}
