import { NombreRol } from '@prisma/client';

export interface AuthenticatedUser {
  sub: string; // id del usuario
  email: string;
  nombre: string;
  rol: NombreRol;
}
