import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cancelReason?: string;
}
