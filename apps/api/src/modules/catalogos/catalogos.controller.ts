import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CatalogosService } from './catalogos.service';
import { CrearColaboradorExternoDto } from './dto/crear-colaborador-externo.dto';

@ApiTags('catalogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  @Get('tipos-servicio')
  tiposServicio() {
    return this.catalogosService.tiposServicio();
  }

  @Get('tipos-equipo')
  tiposEquipo() {
    return this.catalogosService.tiposEquipo();
  }

  @Get('colaboradores-externos')
  colaboradoresExternos() {
    return this.catalogosService.colaboradoresExternos();
  }

  @Post('colaboradores-externos')
  crearColaboradorExterno(@Body() dto: CrearColaboradorExternoDto) {
    return this.catalogosService.crearColaboradorExterno(dto);
  }

  @Get('usuarios')
  usuariosActivos() {
    return this.catalogosService.usuariosActivos();
  }
}
