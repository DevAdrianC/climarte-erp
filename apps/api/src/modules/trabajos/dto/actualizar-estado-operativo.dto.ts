import { ApiProperty } from '@nestjs/swagger';
import { EstadoOperativo } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ActualizarEstadoOperativoDto {
  @ApiProperty({ enum: EstadoOperativo })
  @IsEnum(EstadoOperativo)
  estadoOperativo!: EstadoOperativo;
}
