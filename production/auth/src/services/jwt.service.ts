import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenSigningService {
  constructor(private readonly jwtService: JwtService) {}

  async createAccessToken(
    username: string,
    role: string,
    refreshTokenId: string,
  ) {
    return this.jwtService.signAsync(
      {
        sub: username,
        role,
        id: refreshTokenId,
      },
      {
        algorithm: 'RS256',
        expiresIn: '20m',
      },
    );
  }

  async createRefreshToken(device: string) {
    const refreshToken = await this.jwtService.signAsync(
      {
        device,
      },
      {
        algorithm: 'RS256',
        expiresIn: '90d',
      },
    );

    return refreshToken;
  }

  async verifyRefreshToken(refreshToken: string) {
    return this.jwtService.verifyAsync(refreshToken, { algorithms: ['RS256'] });
  }

  async verifyAccessToken(accessToken: string) {
    return this.jwtService.verifyAsync(accessToken, { algorithms: ['RS256'] });
  }
}
