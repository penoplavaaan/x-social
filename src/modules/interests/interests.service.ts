import { Injectable } from '@nestjs/common';
import { CreateInterestDto } from './dto/create-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags } from '@nestjs/swagger';

@Injectable()
@ApiTags('interests')
export class InterestsService {
  constructor(private readonly db: PrismaService) {}

  create(createInterestDto: CreateInterestDto) {
    return 'This action adds a new interest';
  }

  findAll() {
    return this.db.hobbyCategory.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} interest`;
  }

  update(id: number, updateInterestDto: UpdateInterestDto) {
    return `This action updates a #${id} interest`;
  }

  remove(id: number) {
    return `This action removes a #${id} interest`;
  }
}
