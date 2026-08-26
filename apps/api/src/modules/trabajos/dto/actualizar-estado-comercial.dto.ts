import { ApiProperty } from '@nestjs/swagger';
import { EstadoComercial } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ActualizarEstadoComercialDto {
  @ApiProperty({ enum: EstadoComercial })
  @IsEnum(EstadoComercial)
  estadoComercial!: EstadoComercial;
}
