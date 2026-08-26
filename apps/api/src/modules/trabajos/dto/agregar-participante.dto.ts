import { ApiProperty } from '@nestjs/swagger';
import { RolEnTrabajo } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class AgregarParticipanteDto {
  @ApiProperty({ enum: RolEnTrabajo })
  @IsEnum(RolEnTrabajo)
  rolEnTrabajo!: RolEnTrabajo;

  @ApiProperty({ required: false, description: 'Requerido si rolEnTrabajo no es COLABORADOR_EXTERNO' })
  @ValidateIf((dto) => dto.rolEnTrabajo !== RolEnTrabajo.COLABORADOR_EXTERNO)
  @IsString()
  usuarioId?: string;

  @ApiProperty({ required: false, description: 'Requerido si rolEnTrabajo es COLABORADOR_EXTERNO' })
  @ValidateIf((dto) => dto.rolEnTrabajo === RolEnTrabajo.COLABORADOR_EXTERNO)
  @IsString()
  colaboradorExternoId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  horasDedicadas?: number;
}
