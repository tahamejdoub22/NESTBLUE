import { Controller, Get, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
// Temporarily disabled auth for testing - enable in production
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard data' })
  async getDashboardData(@Request() req) {
    try {
      // For now, use a default userId if not authenticated
      // In production, ensure JWT auth is enabled
      const userId = req.user?.userId || 'default-user-id';
      const data = await this.dashboardService.getDashboardData(userId);
      return { success: true, data };
    } catch (error) {
      console.error('Error in getDashboardData controller:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      throw error;
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats(@Request() req) {
    const userId = req.user?.userId || 'default-user-id';
    const data = await this.dashboardService.getDashboardData(userId);
    return { success: true, data: data.workspaceOverview };
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get dashboard insights' })
  async getInsights(@Request() req) {
    const userId = req.user?.userId || 'default-user-id';
    const data = await this.dashboardService.getDashboardData(userId);
    return { success: true, data: data.taskInsights };
  }

  @Get('project-statistics')
  @ApiOperation({ summary: 'Get project statistics' })
  async getProjectStatistics(@Query('projectId') projectId?: string) {
    const data = await this.dashboardService.getProjectStatistics(projectId);
    return { success: true, data };
  }

  @Get('project-overview')
  @ApiOperation({ summary: 'Get monthly project overview data' })
  async getProjectOverview(@Request() req, @Query('period') period?: string) {
    try {
      const userId = req.user?.userId || req.user?.id || 'default-user';
      const periodType = (period as 'week' | 'month' | 'year') || 'month';
      const data = await this.dashboardService.getMonthlyProjectOverview(userId, periodType);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error in getProjectOverview controller:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
      };
    }
  }

  @Get('projects/:projectId/statistics')
  @ApiOperation({ summary: 'Get statistics for specific project' })
  async getProjectStatisticsById(@Param('projectId') projectId: string) {
    const data = await this.dashboardService.getProjectStatistics(projectId);
    return { success: true, data };
  }
}

