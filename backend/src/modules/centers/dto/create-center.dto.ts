import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsEmail,
    IsOptional,
    IsBoolean,
    IsNumber,
    IsArray,
    Min,
    MinLength,
} from 'class-validator';

export class CreateCenterDto {
    @ApiProperty({ example: 'Downtown Car Wash' })
    @IsString()
    @MinLength(3)
    name: string;

    @ApiPropertyOptional({ example: 'Full-service car wash in downtown' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: '123 Main Street' })
    @IsString()
    address: string;

    @ApiProperty({ example: 'New York' })
    @IsString()
    city: string;

    @ApiProperty({ example: 'NY' })
    @IsString()
    state: string;

    @ApiProperty({ example: '10001' })
    @IsString()
    zipCode: string;

    @ApiProperty({ example: '+1-555-0100' })
    @IsString()
    phone: string;

    @ApiProperty({ example: 'downtown@carwash.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '08:00' })
    @IsString()
    openTime: string;

    @ApiProperty({ example: '20:00' })
    @IsString()
    closeTime: string;

    @ApiProperty({ example: 5 })
    @IsNumber()
    @Min(1)
    capacity: number;

    @ApiPropertyOptional({ example: 40.7580 })
    @IsOptional()
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional({ example: -73.9855 })
    @IsOptional()
    @IsNumber()
    longitude?: number;

    @ApiPropertyOptional({ example: ['WiFi', 'Coffee', 'Waiting Area'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    amenities?: string[];

    @ApiPropertyOptional({
        description: 'List of center photos',
        example: ['http://example.com/photo1.jpg', 'http://example.com/photo2.jpg'],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        example: 30,
        description: 'Time slot interval in minutes (15, 30, or 60)',
        enum: [15, 30, 60]
    })
    @IsOptional()
    @IsNumber()
    timeSlotInterval?: number;

    // Owner creation fields
    @ApiPropertyOptional({
        example: true,
        description: 'Create an owner/admin account for this center'
    })
    @IsOptional()
    @IsBoolean()
    createOwner?: boolean;

    @ApiPropertyOptional({
        example: 'owner@downtown.com',
        description: 'Email for the owner account (required if createOwner is true)'
    })
    @IsOptional()
    @IsEmail()
    ownerEmail?: string;

    @ApiPropertyOptional({
        example: 'John',
        description: 'First name of the owner'
    })
    @IsOptional()
    @IsString()
    ownerFirstName?: string;

    @ApiPropertyOptional({
        example: 'Doe',
        description: 'Last name of the owner'
    })
    @IsOptional()
    @IsString()
    ownerLastName?: string;

    @ApiPropertyOptional({
        example: 'john.downtown',
        description: 'Username for the owner (auto-generated from email if not provided)'
    })
    @IsOptional()
    @IsString()
    ownerUsername?: string;
}
