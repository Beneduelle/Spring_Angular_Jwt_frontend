import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';
import { Router } from '@angular/router';
import { User } from '../model/user';
import { Subscription } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { HeaderType } from '../enum/header-type.enum';
import { NotificationService } from '../service/notification.service';
import { NotificationType } from '../enum/notification-type.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  public showLoading: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor (private router: Router,
     private authenticationService: AuthenticationService,
     private notificationService: NotificationService
     ) {

  }

  ngOnInit(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      console.log("OnInit if user loggedIn")
      this.router.navigateByUrl('/user/management');
    } else {
      console.log("OnInit if user not loggedIn");
      this.router.navigateByUrl('/login');
    }
  }

  public onLogin(user: User): void {
    this.showLoading = true;
    console.log(user);
    this.subscriptions.push(
      this.authenticationService.login(user).subscribe(
        (response: HttpResponse<User> | HttpErrorResponse) => {
          if (response instanceof HttpResponse) {
            const token = response.headers.get(HeaderType.JWT_TOKEN);
            if (token !== null) {
              console.log("Token correct: " + token);
              
              this.authenticationService.saveToken(token);
              const userResponse = response.body;
              if (userResponse !== null) {
                console.log("User Response not null: " + userResponse);
                
                this.authenticationService.addUserToLocalCache(userResponse);
                this.router.navigateByUrl('/user/management');
                this.showLoading = false;
              } else {
                throw new Error('Null pointer exception for user');
              }
            } else {
              throw new Error('Null pointer exception for token');
            }
          } else if (response instanceof HttpErrorResponse) {
            throw new Error("Bad response from backend");
          }
        },
        (errorResponse: HttpErrorResponse) => {
          console.log(errorResponse);
          this.sendErrorNotification(NotificationType.ERROR, errorResponse.error.message);
          this.showLoading = false;
          
        }
      )
    );
  }

  private sendErrorNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'AN ERROR OCCURED. PLEASE TRY AGAIN');
    }
  }
  

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {

    });
  }

}
