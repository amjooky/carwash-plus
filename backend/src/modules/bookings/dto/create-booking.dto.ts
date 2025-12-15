import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsNumber, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  centerId: string;

  @ApiProperty()
  @IsString()
  customerId: string;

  @ApiProperty()
  @IsString()
  vehicleId: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  scheduledDate: Date;

  @ApiProperty()
  @IsString()
  scheduledTime: string; // "14:00"

  @ApiProperty({ required: false, description: 'Bay number (1 to center capacity). Auto-assigned if not provided.' })
  @IsOptional()
  @IsNumber()
  bayNumber?: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  serviceIds: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  staffId?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recurringPattern?: string; // "WEEKLY", "MONTHLY"

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  recurringEndDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  templateId?: string;
}

export class BulkBookingDto {
  @ApiProperty({ type: [CreateBookingDto] })
  @IsArray()
  bookings: CreateBookingDto[];
}

export class AssignStaffDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  staffIds: string[];
}
