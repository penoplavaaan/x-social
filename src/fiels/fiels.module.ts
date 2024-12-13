import { Module } from '@nestjs/common';
import { FilesController } from './fiels.controller';

@Module({
  controllers: [FilesController],
})
export class FielsModule {}
