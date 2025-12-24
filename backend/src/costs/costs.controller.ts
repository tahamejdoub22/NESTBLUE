import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CostsService } from './costs.service';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Costs')
@Controller('costs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CostsController {
  constructor(private readonly costsService: CostsService) {}

  private transformCost(cost: any) {
    return {
      ...cost,
      amount: typeof cost.amount === 'string' ? parseFloat(cost.amount) : cost.amount,
      date: cost.date instanceof Date ? cost.date.toISOString() : cost.date,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new cost' })
  async create(@Body() createCostDto: CreateCostDto) {
    const cost = await this.costsService.create(createCostDto);
    return this.transformCost(cost);
  }

  @Get()
  @ApiOperation({ summary: 'Get all costs' })
  async findAll(@Query('projectId') projectId?: string) {
    try {
      const costs = await this.costsService.findAll(projectId);
      return costs.map(cost => this.transformCost(cost));
    } catch (error) {
      console.error(`Error in costs.findAll for projectId ${projectId}:`, error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cost by ID' })
  async findOne(@Param('id') id: string) {
    const cost = await this.costsService.findOne(id);
    return this.transformCost(cost);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cost' })
  async update(@Param('id') id: string, @Body() updateCostDto: UpdateCostDto) {
    const cost = await this.costsService.update(id, updateCostDto);
    return this.transformCost(cost);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cost' })
  remove(@Param('id') id: string) {
    return this.costsService.remove(id);
  }
}


