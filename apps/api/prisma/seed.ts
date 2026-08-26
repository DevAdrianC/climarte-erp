import { PrismaClient, NombreRol } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando roles...');
  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: NombreRol.ADMIN_SOCIO },
    update: {},
    create: { nombre: NombreRol.ADMIN_SOCIO },
  });
  await prisma.rol.upsert({
    where: { nombre: NombreRol.TECNICO },
    update: {},
    create: { nombre: NombreRol.TECNICO },
  });
  await prisma.rol.upsert({
    where: { nombre: NombreRol.ADMINISTRATIVO },
    update: {},
    create: { nombre: NombreRol.ADMINISTRATIVO },
  });

  console.log('Sembrando usuarios (socios)...');
  // Contraseñas de desarrollo únicamente — cambiar antes de producción.
  const passwordHash = await bcrypt.hash('climarte2026', 10);

  const nahuel = await prisma.usuario.upsert({
    where: { email: 'nahuel@climarte.com.ar' },
    update: {},
    create: {
      nombre: 'Nahuel',
      email: 'nahuel@climarte.com.ar',
      passwordHash,
      rolId: rolAdmin.id,
    },
  });

  const adrian = await prisma.usuario.upsert({
    where: { email: 'adrian@climarte.com.ar' },
    update: {},
    create: {
      nombre: 'Adrián',
      email: 'adrian@climarte.com.ar',
      passwordHash,
      rolId: rolAdmin.id,
    },
  });

  console.log('Sembrando configuración de participación 50/50 (Parte 1 §1.1/§12)...');
  const yaExisteConfiguracion = await prisma.configuracionParticipacion.findFirst();
  if (!yaExisteConfiguracion) {
    const vigenteDesde = new Date('2026-09-01');
    await prisma.configuracionParticipacion.createMany({
      data: [
        { socioId: nahuel.id, porcentaje: 50, vigenteDesde, creadoPorId: nahuel.id },
        { socioId: adrian.id, porcentaje: 50, vigenteDesde, creadoPorId: nahuel.id },
      ],
    });
  }

  console.log('Sembrando catálogos de Tipo de Servicio y Tipo de Equipo (Parte 1 §3)...');
  for (const nombre of ['Instalación', 'Reparación', 'Limpieza', 'Diagnóstico', 'Mantenimiento']) {
    await prisma.tipoServicio.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  for (const nombre of ['Aire acondicionado', 'Heladera', 'Freezer', 'Lavarropas', 'Otro']) {
    await prisma.tipoEquipo.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }

  console.log('Seed completo. Usuarios de prueba:');
  console.log('  nahuel@climarte.com.ar / climarte2026');
  console.log('  adrian@climarte.com.ar / climarte2026');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
