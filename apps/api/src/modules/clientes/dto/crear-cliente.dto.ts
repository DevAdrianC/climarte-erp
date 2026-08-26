import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CrearClienteDto {
  @ApiProperty({ example: 'María González' })
  @IsString()
  @MinLength(2)
  nombre!: string;

  @ApiProperty({ example: '3624123456' })
  @IsString()
  @MinLength(6)
  telefono!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiProperty({ required: false, example: 'Resistencia' })
  @IsOptional()
  @IsString()
  localidad?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
