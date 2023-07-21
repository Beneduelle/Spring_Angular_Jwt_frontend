import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from '../model/user';
import { UserService } from '../service/user.service';
import { NotificationService } from '../service/notification.service';
import { NotificationType } from '../enum/notification-type.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { NgFor } from '@angular/common';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();
  public users: User[] = [];
  public refreshing: boolean = false;
  private subscriptions: Subscription[] = [];
  public selectedUser: User | undefined;
  public fileName: string = "";
  public profileImage: any;

  constructor(private userService: UserService,
    private notificationService: NotificationService) {

  }

  public changeTitle(title: string): void {
    this.titleSubject.next(title);
  }

  public getUsers(showNotification: boolean): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.userService.getUsers().subscribe(
        (response: User[] | HttpErrorResponse) => {
          if (response instanceof HttpErrorResponse) {
            // Handle error response
            this.refreshing = false;
            this.sendNotification(NotificationType.ERROR, response.error.message);
          } else {
            // Handle successful response
            this.userService.addUsersToLocalCache(response);
            this.users = response;
            if (showNotification) {
              this.sendNotification(NotificationType.SUCCESS, `${response.length} user(s) loaded successfully.`);
            }
          }
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
        }
      )      
    );
  }

  public onSelectUser(selectedUser: User): void {
    this.selectedUser = selectedUser;
    this.clickButton('openUserInfo');
  }

  public onProfileImageChange(event: any): void {
    this.fileName = event.files[0].name;
    this.profileImage = event.files[0];
    
  }

  public saveNewUser() {
    this.clickButton('new-user-save');
  }

public onAddNewUser(userForm: NgForm): void {
  const formData = this.userService.createUserFormData("", userForm.value, this.profileImage);
  this.subscriptions.push(
    this.userService.addUser(formData).subscribe(
      (response: User|any) => {
        this.clickButton('new-user-close');
        this.getUsers(false);
        this.fileName = "";
        this.profileImage = null; // OK since profileImage is of type File | null
        this.sendNotification(NotificationType.SUCCESS,
          `${response.firstName} ${response.lastName} updated successfully`)
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
      }
    )
  )
}


  private sendNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'AN ERROR OCCURED. PLEASE TRY AGAIN');
    }
  }

  private clickButton(buttonId: string): void {
    document.getElementById(buttonId)?.click();
  }

  ngOnInit(): void {
    this.getUsers(true);
  }
}
