import { CanActivate, Injectable } from '@nestjs/common';
import { AdminService } from '../services/admin.service';

@Injectable()
export class RegistrationGuard implements CanActivate {
  constructor(private readonly adminService: AdminService) {}

  async canActivate() {
    try {
      const { registrationEnabled } = await this.adminService.getConfig();

      return registrationEnabled;
    } catch {
      return false;
    }
  }
}
