import {
  Controller,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getDashboard(): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboardData();
  }
}
