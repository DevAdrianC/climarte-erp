import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsNumber, IsString, Max, Min, ValidateNested } from 'class-validator';

class ParticipacionSocioDto {
  @ApiProperty()
  @IsString()
  socioId!: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje!: number;
}

export class CrearConfiguracionParticipacionDto {
  @ApiProperty({ type: [ParticipacionSocioDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ParticipacionSocioDto)
  participaciones!: ParticipacionSocioDto[];

  @ApiProperty({ example: '2026-09-01' })
  @IsDateString()
  vigenteDesde!: string;
}
