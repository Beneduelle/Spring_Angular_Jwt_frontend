import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../service/authentication.service';
import { User } from '../model/user';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authenticationService: AuthenticationService) {}

  intercept(HttpRequest: HttpRequest<User>, httpHandler: HttpHandler): Observable<HttpEvent<User>> {
    if (HttpRequest.url.includes(`${this.authenticationService.host}/user/login`)) {
      console.log("login action");
      return httpHandler.handle(HttpRequest);
    }
    if (HttpRequest.url.includes(`${this.authenticationService.host}/user/register`)) {
      console.log("register action");
      return httpHandler.handle(HttpRequest);
    }
    if (HttpRequest.url.includes(`${this.authenticationService.host}/user/resetPassword`)) {
      console.log("password reset action");
      return httpHandler.handle(HttpRequest);
    }
    this.authenticationService.loadToken();
    const token = this.authenticationService.getToken();
    const request = HttpRequest.clone({ setHeaders: { Authorization: `Bearer ${token}`}});
    return httpHandler.handle(request);
  }
}