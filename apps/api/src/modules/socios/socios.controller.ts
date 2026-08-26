import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NombreRol } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { SociosService } from './socios.service';
import { CrearConfiguracionParticipacionDto } from './dto/crear-configuracion-participacion.dto';

@ApiTags('socios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('config-participacion')
export class SociosController {
  constructor(private readonly sociosService: SociosService) {}

  @Get()
  obtenerVigente() {
    return this.sociosService.obtenerVigente();
  }

  @Get('historial')
  listarHistorial() {
    return this.sociosService.listarHistorial();
  }

  @Roles(NombreRol.ADMIN_SOCIO)
  @Post()
  crear(
    @Body() dto: CrearConfiguracionParticipacionDto,
    @CurrentUser() usuario: AuthenticatedUser,
  ) {
    return this.sociosService.crearNuevaConfiguracion(dto, usuario.sub);
  }
}
