import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environmetns';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public host: string = environment.apiUrl;
  private token: string = "";
  private loggedInUsername: string = "";
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) { }

  // public login(user: User): Observable<HttpResponse<any> | HttpErrorResponse> {
  //   return this.http.post<HttpResponse<any> | HttpErrorResponse>
  //   (`${this.host}/user/login`, user,
  //    {observe: 'response'});
  // }

  public login(user: User): Observable<HttpResponse<User>> {
    return this.http.post<User>
    (`${this.host}/user/login`, user,
     {observe: 'response'});
  }

  public register(user: User): Observable<User> {
    return this.http.post<User>
    (`${this.host}/user/register`, user);
  }

  public logout(): void {
    this.token = "";
    this.loggedInUsername = "";
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('users');
  }

  public saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  public addUserToLocalCache(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUserFromLocalCache(): User | any {
    const userString = localStorage.getItem('user');
    if (userString !== null) {
      return JSON.parse(userString);
    }
    return null;
  }

  public loadToken(): void {
    const tokenString = localStorage.getItem('token');
    if (tokenString !== null) {
      this.token = tokenString;
    }
  }

  public getToken(): string {
    return this.token;
  }

  public isUserLoggedIn(): boolean {
    this.loadToken();
    console.log("Token from isUserLoggedIn: " + this.token);
    
    if (this.token != null && this.token !== '') {
      if (this.jwtHelper.decodeToken(this.token).sub != null || '') {
        if (!this.jwtHelper.isTokenExpired(this.token)) {
          const decodedToken = this.jwtHelper.decodeToken(this.token);
          if (decodedToken !== null) { 
            this.loggedInUsername = decodedToken;
            return true;
          }
        }
      }
    } else {
      this.logout();
      return false;
    }
    return false;
  }
  
}