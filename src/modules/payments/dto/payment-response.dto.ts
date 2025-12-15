import { ApiProperty } from '@nestjs/swagger';
import { Payment, PaymentStatus } from '@prisma/client';

export class PaymentResponseDto {
  @ApiProperty({ description: 'Unique identifier of the payment' })
  id: string;

  @ApiProperty({ description: 'Booking ID associated with the payment' })
  bookingId: string;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({ description: 'Payment currency code (e.g., USD, EUR)' })
  currency: string;

  @ApiProperty({ enum: PaymentStatus, description: 'Current status of the payment' })
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment method used' })
  paymentMethod: string;

  @ApiProperty({ description: 'Transaction ID from the payment processor' })
  transactionId: string;

  @ApiProperty({ description: 'Date when the payment was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the payment was last updated' })
  updatedAt: Date;

  constructor(payment: Payment) {
    this.id = payment.id;
    this.bookingId = payment.bookingId;
    this.amount = payment.amount;
    this.currency = 'USD'; // Default currency since not in Payment model
    this.status = payment.status;
    this.paymentMethod = payment.method; // Field is 'method' not 'paymentMethod'
    this.transactionId = payment.transactionId || ''; // Can be null
    this.createdAt = payment.createdAt;
    this.updatedAt = payment.updatedAt;
  }
}
