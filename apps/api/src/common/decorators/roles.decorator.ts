import { SetMetadata } from '@nestjs/common';
import { NombreRol } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Marca qué roles pueden acceder a un endpoint.
 * Uso: @Roles(NombreRol.ADMIN_SOCIO)
 *
 * Hoy en el MVP solo existe ADMIN_SOCIO activo, pero la infraestructura
 * ya soporta TECNICO y ADMINISTRATIVO sin cambios (Parte 3 §10).
 */
export const Roles = (...roles: NombreRol[]) => SetMetadata(ROLES_KEY, roles);
