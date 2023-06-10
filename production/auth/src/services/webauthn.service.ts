import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { ConfigService } from './config/config.service';
import { Cache } from 'cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

enum USER_MESSAGE_PATTERNS {
  GET_USER = 'user.getUser',
}

@Injectable()
export class WebAuthnService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('USER_SERVICE')
    private readonly userServiceClient: ClientProxy,
  ) {}

  async getUserAuthenticators(
    username: string,
  ): Promise<PublicKeyCredentialDescriptor[]> {
    const { credentials } = await firstValueFrom(
      this.userServiceClient
        .send<{
          credentials: {
            credentialId: string;
            transports: AuthenticatorTransport[];
          }[];
        }>(USER_MESSAGE_PATTERNS.GET_USER, {
          id: username,
        })
        .pipe(timeout(5000)),
    );

    return credentials.map((authenticator) => ({
      id: Buffer.from(authenticator.credentialId, 'utf-8'),
      type: 'public-key',
      transports: authenticator.transports,
    }));
  }

  async generateOptions(username: string) {
    const options = generateRegistrationOptions({
      rpName: this.configService.get('WEBAUTHN_RPNAME'),
      rpID: this.configService.get('WEBAUTHN_RPID'),
      userID: username,
      userName: username,
      userDisplayName: username,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials: await this.getUserAuthenticators(username),
      authenticatorSelection: {
        residentKey: 'discouraged',
        userVerification: 'required',
      },
      /**
       * Support the two most common algorithms: ES256, and RS256
       */
      supportedAlgorithmIDs: [-7, -257],
    });

    // Store the challenge for later verification
    await this.cacheManager.set(`authn-${username}`, options.challenge, 60000);

    return options;
  }

  async verify(username: string, body: any) {
    try {
      console.log('verify', username, body);

      // Retrieve the challenge from the cache
      const expectedChallenge = await this.cacheManager.get<string>(
        `challenge-${username}`,
      );
      const verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: this.configService.get('WEBAUTHN_ORIGIN'),
        expectedRPID: this.configService.get('WEBAUTHN_RPID'),
      });

      return verification;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
