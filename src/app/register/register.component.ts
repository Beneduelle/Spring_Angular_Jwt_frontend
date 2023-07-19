import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../model/user';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NotificationType } from '../enum/notification-type.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {

  public showLoading: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(private router: Router, private authenticationService: AuthenticationService,
    private notificationService: NotificationService) {
      
    }

  ngOnInit(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/user/management');
    }
  }

  public onRegister(user: User): void {
    this.showLoading = true;
    this.subscriptions.push(
      this.authenticationService.register(user).subscribe(
        (response: User) => {
         this.showLoading = false;
         this.sendNotification(NotificationType.SUCCESS,
           `A new account was created for ${response.firstName}.
            Please check your email for password to log in.`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.showLoading = false;
        }
      )
    );
  }

  private sendNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'AN ERROR OCCURED. PLEASE TRY AGAIN');
    }
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
  }
}
