import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environmetns';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { CustomHttpResponse } from '../model/custom-http-response';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public getUsers(): Observable<User[]|HttpErrorResponse> {
    return this.http.get<User[]>(`${this.host}/user/list`);
  }

  public addUser(formData: FormData): Observable<User|HttpErrorResponse> {
    return this.http.post<User>(`${this.host}/user/add`, formData);
  }

  public updateUser(formData: FormData): Observable<User|HttpErrorResponse> {
    return this.http.post<User>(`${this.host}/user/update`, formData);
  }

  public resetPassword(email: string): Observable<CustomHttpResponse|HttpErrorResponse> {
    return this.http.get<CustomHttpResponse>(`${this.host}/resetPassword/${email}`);
  }

  public updateProfileImage(formData: FormData): Observable<HttpEvent<any>> {
    return this.http.post<User>(`${this.host}/user/updateProfileImage`,
     formData,
     {reportProgress: true,
      observe: 'events'
    });
  }

  // public deleteUser(userId: number): Observable<CustomHttpResponse|HttpErrorResponse> {
  //   return this.http.delete<CustomHttpResponse>(`${this.host}/user/delete/${userId}`);
  // }

  public deleteUser(username: string): Observable<CustomHttpResponse|HttpErrorResponse> {
    return this.http.delete<CustomHttpResponse>(`${this.host}/user/delete/${username}`);
  }

  public addUsersToLocalCache(users: User[]): void {
    localStorage.setItem('users', JSON.stringify(users));
  }

  public getUsersFromLocalCache(): User[] {
    const usersFromCache = localStorage.getItem('users');
    if (usersFromCache !== null) {
      return JSON.parse(usersFromCache) as User[];
    }
    return [];
  }

  public createUserFormData(loggedInUsername: string, user: User, profileImage: File): FormData {
      const formData = new FormData();
      formData.append('currentUsername', loggedInUsername);
      formData.append('firstName', user.firstName);
      formData.append('lastName', user.lastName);
      formData.append('username', user.username),
      formData.append('email', user.email),
      formData.append('role', user.role);
      formData.append('profileImage', profileImage),
      formData.append('isActive', JSON.stringify(user.active)),
      formData.append('isNotLocked', JSON.stringify(user.notLocked));
      return formData;
  }
  
}
