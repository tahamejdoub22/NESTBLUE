import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private contractsRepository: Repository<Contract>,
  ) {}

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    const contract = this.contractsRepository.create(createContractDto);
    return this.contractsRepository.save(contract);
  }

  async findAll(projectId?: string): Promise<Contract[]> {
    const where = projectId ? { projectId } : {};
    return this.contractsRepository.find({
      where,
      relations: ['project'],
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractsRepository.findOne({
      where: { id },
      relations: ['project'],
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return contract;
  }

  async update(id: string, updateContractDto: UpdateContractDto): Promise<Contract> {
    const contract = await this.findOne(id);
    Object.assign(contract, updateContractDto);
    return this.contractsRepository.save(contract);
  }

  async remove(id: string): Promise<void> {
    const contract = await this.findOne(id);
    await this.contractsRepository.remove(contract);
  }
}


