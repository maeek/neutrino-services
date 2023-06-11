import { CanActivate, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class WsAuthGuard implements CanActivate {
  // constructor(private readonly authService: AuthService) {}

  async canActivate(context: any): Promise<boolean | any> {
    const bearerToken =
      context.args[0].handshake.headers.authorization.split(' ')[1];
    try {
      // const decoded = jwt.verify(bearerToken, jwtConstants.secret) as any;
      // return new Promise((resolve, reject) => {
      //   return this.userService
      //     .findByUsername(decoded.username)
      //     .then((user) => {
      //       if (user) {
      //         resolve(user);
      //       } else {
      //         reject(false);
      //       }
      //     });
      // });
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}
