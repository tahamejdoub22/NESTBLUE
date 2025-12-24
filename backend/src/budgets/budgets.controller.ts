import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Budgets')
@Controller('budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets' })
  findAll(@Query('projectId') projectId?: string) {
    return this.budgetsService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget by ID' })
  findOne(@Param('id') id: string) {
    return this.budgetsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update budget' })
  update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetsService.update(id, updateBudgetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete budget' })
  remove(@Param('id') id: string) {
    return this.budgetsService.remove(id);
  }
}


