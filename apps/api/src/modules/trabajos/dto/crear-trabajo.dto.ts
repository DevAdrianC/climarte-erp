import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CrearTrabajoDto {
  @ApiProperty()
  @IsString()
  clienteId!: string;

  @ApiProperty()
  @IsString()
  tipoEquipoId!: string;

  @ApiProperty()
  @IsString()
  tipoServicioId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ required: false, example: 60000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioPresupuestado?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  formaPago?: string;

  @ApiProperty({ required: false, default: 90 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  garantiaDias?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
