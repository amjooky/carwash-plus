import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
    @ApiProperty()
    @IsString()
    userId: string;

    @ApiProperty({ enum: NotificationType })
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    message: string;

    @ApiProperty({ required: false })
    @IsOptional()
    data?: any;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    bookingId?: string;
}

export class BroadcastNotificationDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    message: string;
}

export class MarkAsReadDto {
    @ApiProperty()
    @IsBoolean()
    isRead: boolean;
}
