-- CreateTable
CREATE TABLE "ingresos" (
    "id" TEXT NOT NULL,
    "trabajo_id" TEXT NOT NULL,
    "importe" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forma_pago" TEXT,
    "creado_por_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingresos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retiros_socios" (
    "id" TEXT NOT NULL,
    "socio_id" TEXT NOT NULL,
    "importe" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concepto" TEXT,
    "observaciones" TEXT,
    "creado_por_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retiros_socios_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ingresos" ADD CONSTRAINT "ingresos_trabajo_id_fkey" FOREIGN KEY ("trabajo_id") REFERENCES "trabajos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingresos" ADD CONSTRAINT "ingresos_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retiros_socios" ADD CONSTRAINT "retiros_socios_socio_id_fkey" FOREIGN KEY ("socio_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retiros_socios" ADD CONSTRAINT "retiros_socios_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
