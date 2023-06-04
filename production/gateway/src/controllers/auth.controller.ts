import { Controller, Get } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Health')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/health')
  async getHealth() {
    return this.authService.getHealth();
  }
}
