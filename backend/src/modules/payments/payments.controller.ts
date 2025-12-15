import { Controller, Post, Body, Get, Param, UseGuards, Req, RawBodyRequest, Headers } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('create-intent')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Create payment intent' })
    async createPaymentIntent(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentsService.createPaymentIntent(createPaymentDto);
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Stripe webhook handler' })
    async handleWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() req: RawBodyRequest<Request>,
    ) {
        if (!signature) {
            throw new Error('Missing stripe-signature header');
        }
        // We need the raw body for signature verification
        const rawBody = req.rawBody;
        if (!rawBody) {
            throw new Error('Raw body is missing');
        }
        return this.paymentsService.handleWebhook(signature, rawBody);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get payment details' })
    async getPayment(@Param('id') id: string) {
        return this.paymentsService.getPayment(id);
    }

    @Post(':id/refund')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Refund payment' })
    async refundPayment(
        @Param('id') id: string,
        @Body('amount') amount?: number,
    ) {
        return this.paymentsService.refundPayment(id, amount);
    }
}
