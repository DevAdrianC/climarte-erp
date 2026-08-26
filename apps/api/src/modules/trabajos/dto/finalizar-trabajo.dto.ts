import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class FinalizarTrabajoDto {
  @ApiProperty({ example: 65000 })
  @IsNumber()
  @Min(0)
  precioFinal!: number;
}
