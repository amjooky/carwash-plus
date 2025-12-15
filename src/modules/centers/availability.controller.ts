import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Availability')
@Controller('centers')
export class AvailabilityController {
    constructor(private readonly availabilityService: AvailabilityService) { }

    @Get(':id/availability')
    @ApiOperation({
        summary: 'Get available time slots for a center on a specific date',
        description: 'Returns all time slots with availability information (capacity, booked, available)'
    })
    @ApiQuery({ name: 'date', required: true, example: '2025-12-15', description: 'Date in YYYY-MM-DD format' })
    async getAvailability(
        @Param('id') centerId: string,
        @Query('date') dateString: string,
    ) {
        const date = new Date(dateString);
        return this.availabilityService.getAvailability(centerId, date);
    }

    @Get(':id/availability/check')
    @ApiOperation({
        summary: 'Check if a specific time slot is available',
        description: 'Returns availability status for a specific time slot'
    })
    @ApiQuery({ name: 'date', required: true, example: '2025-12-15' })
    @ApiQuery({ name: 'time', required: true, example: '14:00' })
    async checkSlot(
        @Param('id') centerId: string,
        @Query('date') dateString: string,
        @Query('time') time: string,
    ) {
        const date = new Date(dateString);
        return this.availabilityService.checkSlotAvailability(centerId, date, time);
    }
}
