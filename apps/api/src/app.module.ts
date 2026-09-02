import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsuariosModule } from "./modules/usuarios/usuarios.module";
import { SociosModule } from "./modules/socios/socios.module";
import { ClientesModule } from "./modules/clientes/clientes.module";
import { TrabajosModule } from "./modules/trabajos/trabajos.module";
import { CatalogosModule } from "./modules/catalogos/catalogos.module";
import { GastosModule } from "./modules/gastos/gastos.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === "production" ? "info" : "debug",
        redact: ["req.headers.authorization", "req.body.password"],
        transport:
          process.env.NODE_ENV === "production"
            ? undefined
            : { target: "pino-pretty", options: { singleLine: true } },
      },
    }),
    // Rate limiting global liviano; se ajusta por endpoint donde haga falta (ej. /auth/login).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    SociosModule,
    ClientesModule,
    TrabajosModule,
    CatalogosModule,
    GastosModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
