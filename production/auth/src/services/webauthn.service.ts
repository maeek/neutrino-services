import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { ConfigService } from './config/config.service';
import { Cache } from 'cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { AuthenticationResponseJSON } from '@simplewebauthn/typescript-types';
import { PublicKeyCredentialDescriptorFuture } from '@simplewebauthn/typescript-types';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

enum USER_MESSAGE_PATTERNS {
  GET_USER = 'user.getUser',
  CHECK_IF_CREDENTIAL_ID_EXISTS = 'user.checkIfCredentialIdExists',
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

  async getUserAuthenticators(username: string) {
    const user = await firstValueFrom(
      this.userServiceClient
        .send<{
          credentials: {
            credentialId: string;
            counter: number;
            publicKey: string;
            transports: AuthenticatorTransport[];
          }[];
        }>(USER_MESSAGE_PATTERNS.GET_USER, {
          id: username,
        })
        .pipe(timeout(5000)),
    );

    return (
      user?.credentials.map((authenticator) => ({
        id: isoBase64URL.toBuffer(authenticator.credentialId),
        publicKey: isoBase64URL.toBuffer(authenticator.publicKey),
        counter: authenticator.counter,
        type: 'public-key',
        transports: authenticator.transports,
      })) || []
    );
  }

  async checkIfCredentialIsAlreadyUsed(credentialId: string) {
    const exists = await firstValueFrom(
      this.userServiceClient
        .send<boolean>(USER_MESSAGE_PATTERNS.CHECK_IF_CREDENTIAL_ID_EXISTS, {
          credentialId,
        })
        .pipe(timeout(5000)),
    );

    return exists;
  }

  async generateRegistrationOptions(username: string) {
    const options = generateRegistrationOptions({
      rpName: this.configService.get('WEBAUTHN_RPNAME'),
      rpID: this.configService.get('WEBAUTHN_RPID'),
      userID: username,
      userName: username,
      userDisplayName: username,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials: [],
      authenticatorSelection: {
        residentKey: 'discouraged',
        userVerification: 'required',
      },
      /**
       * Support the two most common algorithms: ES256, and RS256
       */
      supportedAlgorithmIDs: [-7, -257],
      extensions: {
        credProps: true,
      },
    });

    // Store the challenge for later verification
    await this.cacheManager.set(
      `challenge-${username}`,
      options.challenge,
      120000,
    );

    return options;
  }

  async verifyRegistration(username: string, body: any) {
    try {
      const exists = await this.checkIfCredentialIsAlreadyUsed(body.id);

      if (exists) {
        return {
          verified: false,
        };
      }

      // Retrieve the challenge from the cache
      const expectedChallenge = await this.cacheManager.get<string>(
        `challenge-${username}`,
      );

      const verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        supportedAlgorithmIDs: [-7, -257],
        expectedOrigin: this.configService.get('WEBAUTHN_ORIGIN'),
        expectedRPID: this.configService.get('WEBAUTHN_RPID'),
      });

      const credentialPublicKey = isoBase64URL.fromBuffer(
        verification.registrationInfo.credentialPublicKey,
      );

      await this.cacheManager.del(`challenge-${username}`);

      return {
        verified: verification.verified,
        credentialId: body.id,
        publicKey: credentialPublicKey,
        transports: body.response.transports,
        signCount: verification.registrationInfo.counter,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        verified: false,
      };
    }
  }

  async generateAuthenticationOptions(username: string) {
    const options = generateAuthenticationOptions({
      allowCredentials: (await this.getUserAuthenticators(
        username,
      )) as PublicKeyCredentialDescriptorFuture[],
      userVerification: 'required',
      timeout: 120000,
      rpID: this.configService.get('WEBAUTHN_RPID'),
    });

    // Store the challenge for later verification
    await this.cacheManager.set(
      `challenge-${username}`,
      options.challenge,
      60000,
    );

    return options;
  }

  async verifyAuth(username: string, body: AuthenticationResponseJSON) {
    try {
      const authenticators = await this.getUserAuthenticators(username);
      const authenticator = authenticators.find(
        (a) => a.id.toString() === body.id,
      );

      // Retrieve the challenge from the cache
      const expectedChallenge = await this.cacheManager.get<string>(
        `challenge-${username}`,
      );
      const verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: this.configService.get('WEBAUTHN_ORIGIN'),
        expectedRPID: this.configService.get('WEBAUTHN_RPID'),
        authenticator: {
          ...authenticator,
          credentialID: authenticator.id,
          credentialPublicKey: authenticator.publicKey,
        },
      });

      return verification;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
