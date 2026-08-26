-- CreateEnum
CREATE TYPE "EstadoComercial" AS ENUM ('CONSULTA', 'PRESUPUESTO', 'PRESUPUESTO_ENVIADO', 'APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "EstadoOperativo" AS ENUM ('PROGRAMADO', 'EN_EJECUCION', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PARCIAL', 'COBRADO');

-- CreateEnum
CREATE TYPE "RolEnTrabajo" AS ENUM ('RESPONSABLE', 'PARTICIPANTE', 'COLABORADOR_EXTERNO');

-- CreateEnum
CREATE TYPE "TipoCosto" AS ENUM ('MATERIALES', 'TRANSPORTE', 'MANO_OBRA_EXTERNA', 'OTRO');

-- CreateTable
CREATE TABLE "tipos_servicio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "tipos_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_equipo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "tipos_equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colaboradores_externos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "observaciones" TEXT,

    CONSTRAINT "colaboradores_externos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trabajos" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_equipo_id" TEXT NOT NULL,
    "tipo_servicio_id" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado_comercial" "EstadoComercial" NOT NULL DEFAULT 'CONSULTA',
    "estado_operativo" "EstadoOperativo" NOT NULL DEFAULT 'PROGRAMADO',
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "precio_presupuestado" DECIMAL(12,2),
    "precio_final" DECIMAL(12,2),
    "forma_pago" TEXT,
    "garantia_dias" INTEGER NOT NULL DEFAULT 90,
    "garantia_observaciones" TEXT,
    "observaciones" TEXT,
    "creado_por_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trabajos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trabajo_participantes" (
    "id" TEXT NOT NULL,
    "trabajo_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "colaborador_externo_id" TEXT,
    "rol_en_trabajo" "RolEnTrabajo" NOT NULL,
    "horas_dedicadas" DECIMAL(6,2),

    CONSTRAINT "trabajo_participantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "costos_trabajo" (
    "id" TEXT NOT NULL,
    "trabajo_id" TEXT NOT NULL,
    "tipo" "TipoCosto" NOT NULL,
    "importe" DECIMAL(12,2) NOT NULL,
    "descripcion" TEXT,
    "pagado_por_id" TEXT,
    "comprobante_url" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "costos_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_servicio_nombre_key" ON "tipos_servicio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_equipo_nombre_key" ON "tipos_equipo"("nombre");

-- AddForeignKey
ALTER TABLE "trabajos" ADD CONSTRAINT "trabajos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trabajos" ADD CONSTRAINT "trabajos_tipo_equipo_id_fkey" FOREIGN KEY ("tipo_equipo_id") REFERENCES "tipos_equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trabajos" ADD CONSTRAINT "trabajos_tipo_servicio_id_fkey" FOREIGN KEY ("tipo_servicio_id") REFERENCES "tipos_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trabajo_participantes" ADD CONSTRAINT "trabajo_participantes_trabajo_id_fkey" FOREIGN KEY ("trabajo_id") REFERENCES "trabajos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trabajo_participantes" ADD CONSTRAINT "trabajo_participantes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trabajo_participantes" ADD CONSTRAINT "trabajo_participantes_colaborador_externo_id_fkey" FOREIGN KEY ("colaborador_externo_id") REFERENCES "colaboradores_externos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costos_trabajo" ADD CONSTRAINT "costos_trabajo_trabajo_id_fkey" FOREIGN KEY ("trabajo_id") REFERENCES "trabajos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costos_trabajo" ADD CONSTRAINT "costos_trabajo_pagado_por_id_fkey" FOREIGN KEY ("pagado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
