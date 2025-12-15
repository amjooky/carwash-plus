import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';
import Stripe from 'stripe';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      this.logger.error('STRIPE_SECRET_KEY is not defined in environment variables');
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16', // Use a stable supported version
    });
  }

  async createPaymentIntent(createPaymentDto: CreatePaymentDto) {
    const { bookingId, amount, currency = 'usd', paymentMethodType = 'card' } = createPaymentDto;

    // Verify booking exists and get amount if not provided
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        services: {
          include: { service: true }
        }
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Use booking amount if not provided in DTO
    const paymentAmount = amount || booking.finalAmount;

    if (paymentAmount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    try {
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(paymentAmount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        payment_method_types: [paymentMethodType],
        metadata: {
          bookingId,
          customerId: booking.customerId,
          // Use the first service name or ID as strict metadata if available
          serviceInfo: booking.services.length > 0 ? booking.services[0].service.name : 'Multiple Services',
        },
      });

      // Create payment record in database
      // Note: Payment model does NOT have currency or metadata fields
      const payment = await this.prisma.payment.create({
        data: {
          bookingId,
          amount: paymentAmount,
          method: 'CARD', // Enum PaymentMethod.CARD
          status: PaymentStatus.PENDING,
          transactionId: paymentIntent.id,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
        amount: paymentAmount,
        currency: currency.toUpperCase(),
      };
    } catch (error) {
      this.logger.error(`Error creating payment intent: ${error.message}`, error.stack);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  async confirmPayment(paymentIntentId: string) {
    try {
      // Verify the payment with Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      // Update payment status in database
      const updatedPayment = await this.prisma.payment.update({
        where: { transactionId: paymentIntentId },
        data: {
          status: this.mapStripeStatusToPaymentStatus(paymentIntent.status),
          // Metadata and currency are not stored in our simple Payment model
        },
        include: {
          booking: true,
        },
      });

      // If payment is successful, update booking status
      if (paymentIntent.status === 'succeeded') {
        await this.prisma.booking.update({
          where: { id: updatedPayment.bookingId },
          data: {
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
          },
        });
      }

      return updatedPayment;
    } catch (error) {
      this.logger.error(`Error confirming payment: ${error.message}`, error.stack);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        this.logger.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        await this.confirmPayment(paymentIntent.id);
        break;
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        this.logger.warn(`Payment failed: ${failedPayment.last_payment_error?.message}`);
        await this.updatePaymentStatus(failedPayment.id, PaymentStatus.FAILED);
        break;
      // Add more event types as needed
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  async getPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            services: { include: { service: true } },
            customer: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    return payment;
  }

  async getPaymentsByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: {
          booking: {
            customerId: userId,
          },
        },
        include: {
          booking: {
            include: {
              services: { include: { service: true } },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({
        where: {
          booking: {
            customerId: userId,
          },
        },
      }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async refundPayment(paymentId: string, amount?: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Only paid payments can be refunded');
    }

    if (!payment.transactionId) {
      throw new BadRequestException('Payment does not have a transaction ID');
    }

    try {
      const refundAmount = amount ? Math.round(amount * 100) : undefined;

      const refund = await this.stripe.refunds.create({
        payment_intent: payment.transactionId,
        amount: refundAmount,
      });

      // Update payment status to REFUNDED or PARTIAL_REFUND
      const newStatus = amount && amount < payment.amount
        ? PaymentStatus.PARTIAL
        : PaymentStatus.REFUNDED;

      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
        },
      });

      return {
        id: refund.id,
        amount: refund.amount ? refund.amount / 100 : undefined,
        status: refund.status,
      };
    } catch (error) {
      this.logger.error(`Error processing refund: ${error.message}`, error.stack);
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  private async updatePaymentStatus(paymentIntentId: string, status: PaymentStatus) {
    return this.prisma.payment.update({
      where: { transactionId: paymentIntentId },
      data: { status },
    });
  }

  private mapStripeStatusToPaymentStatus(stripeStatus: string): PaymentStatus {
    switch (stripeStatus) {
      case 'succeeded':
        return PaymentStatus.PAID;
      case 'processing':
      case 'requires_action':
      case 'requires_confirmation':
      case 'requires_payment_method':
        return PaymentStatus.PENDING;
      case 'canceled':
      case 'failed':
        return PaymentStatus.FAILED;
      default:
        return PaymentStatus.PENDING;
    }
  }
}
