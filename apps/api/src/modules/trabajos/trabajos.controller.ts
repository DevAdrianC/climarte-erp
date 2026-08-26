import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { TrabajosService } from './trabajos.service';
import { CrearTrabajoDto } from './dto/crear-trabajo.dto';
import { ActualizarEstadoComercialDto } from './dto/actualizar-estado-comercial.dto';
import { ActualizarEstadoOperativoDto } from './dto/actualizar-estado-operativo.dto';
import { FinalizarTrabajoDto } from './dto/finalizar-trabajo.dto';
import { AgregarParticipanteDto } from './dto/agregar-participante.dto';
import { AgregarCostoDto } from './dto/agregar-costo.dto';

@ApiTags('trabajos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trabajos')
export class TrabajosController {
  constructor(private readonly trabajosService: TrabajosService) {}

  @Post()
  crear(@Body() dto: CrearTrabajoDto, @CurrentUser() usuario: AuthenticatedUser) {
    return this.trabajosService.crear(dto, usuario.sub);
  }

  @Get()
  listar(
    @Query('estadoComercial') estadoComercial?: string,
    @Query('estadoOperativo') estadoOperativo?: string,
    @Query('clienteId') clienteId?: string,
  ) {
    return this.trabajosService.listar({ estadoComercial, estadoOperativo, clienteId });
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.trabajosService.obtenerPorId(id);
  }

  @Patch(':id/estado-comercial')
  actualizarEstadoComercial(@Param('id') id: string, @Body() dto: ActualizarEstadoComercialDto) {
    return this.trabajosService.actualizarEstadoComercial(id, dto);
  }

  @Patch(':id/estado-operativo')
  actualizarEstadoOperativo(@Param('id') id: string, @Body() dto: ActualizarEstadoOperativoDto) {
    return this.trabajosService.actualizarEstadoOperativo(id, dto);
  }

  @Patch(':id/finalizar')
  finalizar(@Param('id') id: string, @Body() dto: FinalizarTrabajoDto) {
    return this.trabajosService.finalizar(id, dto);
  }

  @Post(':id/participantes')
  agregarParticipante(@Param('id') id: string, @Body() dto: AgregarParticipanteDto) {
    return this.trabajosService.agregarParticipante(id, dto);
  }

  @Delete(':id/participantes/:participanteId')
  quitarParticipante(@Param('id') id: string, @Param('participanteId') participanteId: string) {
    return this.trabajosService.quitarParticipante(id, participanteId);
  }

  @Post(':id/costos')
  agregarCosto(@Param('id') id: string, @Body() dto: AgregarCostoDto) {
    return this.trabajosService.agregarCosto(id, dto);
  }

  @Delete(':id/costos/:costoId')
  quitarCosto(@Param('id') id: string, @Param('costoId') costoId: string) {
    return this.trabajosService.quitarCosto(id, costoId);
  }
}
