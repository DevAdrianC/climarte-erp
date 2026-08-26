import { ApiProperty } from '@nestjs/swagger';
import { TipoCosto } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AgregarCostoDto {
  @ApiProperty({ enum: TipoCosto })
  @IsEnum(TipoCosto)
  tipo!: TipoCosto;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  importe!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    required: false,
    description: 'Socio que adelantó el gasto de su bolsillo (para el reembolso en la Liquidación mensual)',
  })
  @IsOptional()
  @IsString()
  pagadoPorId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comprobanteUrl?: string;
}
