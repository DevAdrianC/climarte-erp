import { Module } from '@nestjs/common';
import { TrabajosController } from './trabajos.controller';
import { TrabajosService } from './trabajos.service';

@Module({
  controllers: [TrabajosController],
  providers: [TrabajosService],
})
export class TrabajosModule {}
