import { IsString, IsNumber, IsOptional, IsEnum, IsPositive } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsString()
  bookingId: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string = 'usd';

  @IsString()
  @IsOptional()
  @IsEnum(PaymentMethod, {
    message: 'Invalid payment method. Must be one of: CASH, CARD, MOBILE, ONLINE',
  })
  paymentMethodType?: string = 'CARD';

  @IsString()
  @IsOptional()
  description?: string;
}
