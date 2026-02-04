import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cost } from "./entities/cost.entity";
import { CreateCostDto } from "./dto/create-cost.dto";
import { UpdateCostDto } from "./dto/update-cost.dto";

@Injectable()
export class CostsService {
  constructor(
    @InjectRepository(Cost)
    private costsRepository: Repository<Cost>,
  ) {}

  async create(createCostDto: CreateCostDto): Promise<Cost> {
    const cost = this.costsRepository.create(createCostDto);
    return this.costsRepository.save(cost);
  }

  async findAll(projectId?: string): Promise<Cost[]> {
    try {
      const where = projectId ? { projectId } : {};
      return await this.costsRepository.find({
        where,
        relations: [], // Simplified - don't load relations to avoid circular dependencies
        order: { date: "DESC" },
      });
    } catch (error) {
      console.error(
        `Error in CostsService.findAll for projectId ${projectId}:`,
        error,
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<Cost> {
    try {
      const cost = await this.costsRepository.findOne({
        where: { id },
        relations: [], // Simplified - don't load relations to avoid circular dependencies
      });

      if (!cost) {
        throw new NotFoundException(`Cost with ID ${id} not found`);
      }

      return cost;
    } catch (error) {
      console.error(`Error in CostsService.findOne for id ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  async update(id: string, updateCostDto: UpdateCostDto): Promise<Cost> {
    const cost = await this.findOne(id);
    Object.assign(cost, updateCostDto);
    return this.costsRepository.save(cost);
  }

  async remove(id: string): Promise<void> {
    const cost = await this.findOne(id);
    await this.costsRepository.remove(cost);
  }
}
