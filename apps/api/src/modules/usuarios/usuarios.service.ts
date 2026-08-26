import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    });
  }

  findById(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: { rol: true },
    });
  }

  findAllActivos() {
    return this.prisma.usuario.findMany({
      where: { activo: true },
      include: { rol: true },
      orderBy: { nombre: 'asc' },
    });
  }
}
