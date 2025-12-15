import { IsString, IsBoolean, IsNumber, IsArray, IsOptional, Min, ValidateNested, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { VehicleType } from '@prisma/client';

export class ServicePricingDto {
  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice: number;
}

export class CreateServiceDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  centerId: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(15)
  baseDuration: number;

  @ApiProperty({ required: false, default: true })
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiProperty({ type: [ServicePricingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicePricingDto)
  pricing: ServicePricingDto[];
}

export class UpdateServiceDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(15)
  @IsOptional()
  baseDuration?: number;

  @ApiProperty({ required: false })
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ type: [ServicePricingDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicePricingDto)
  @IsOptional()
  pricing?: ServicePricingDto[];
}
