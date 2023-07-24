import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from '../model/user';
import { UserService } from '../service/user.service';
import { NotificationService } from '../service/notification.service';
import { NotificationType } from '../enum/notification-type.enum';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { NgFor } from '@angular/common';
import { NgForm } from '@angular/forms';
import { CustomHttpResponse } from '../model/custom-http-response';
import { AuthenticationService } from '../service/authentication.service';
import { Router } from '@angular/router';
import { FileUploadStatus } from '../model/file-upload.status';
import { Role } from '../enum/role.enum';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();
  public users: User[] = [];
  public user: User = new User();
  public refreshing: boolean = false;
  private subscriptions: Subscription[] = [];
  public selectedUser: User | undefined;
  public fileName: string = "";
  public profileImage: any;
  public editUser = new User();
  private currentUsername: string = "";
  public authorities: string[] = [];
  public fileStatus = new FileUploadStatus();

  constructor(private userService: UserService,
    private router: Router,
    private notificationService: NotificationService,
    private authenticationService: AuthenticationService) {

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
        this.profileImage = null;
        this.sendNotification(NotificationType.SUCCESS,
          `${response.firstName} ${response.lastName} updated successfully`)
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.profileImage = null;
      }
    )
  )
}


  public searchUsers(searchTerm: string):void {
    const results: User[] = [];
    for (const user of this.userService.getUsersFromLocalCache()) {
      if (user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      user.email.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
      user.userId.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
          results.push(user);
      }
    }
    this.users = results;
    if (results.length == 0 || !searchTerm) {
        this.users = this.userService.getUsersFromLocalCache();
    }
  }

  public onUpdateUser(): void {
    const formData = this.userService.createUserFormData(this.currentUsername, this.editUser, this.profileImage);
    this.subscriptions.push(
      this.userService.updateUser(formData).subscribe(
        (response: User|any) => {
          this.clickButton('closeEditUserModalButton');
          this.getUsers(false);
          this.fileName = "";
          this.profileImage = null;
          this.sendNotification(NotificationType.SUCCESS,
            `${response.firstName} ${response.lastName} updated successfully`)
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.profileImage = null;
        }
      )
    )
  }

  public onUpdateCurrentUser(user: User): void {
    this.refreshing = true;
    this.currentUsername = this.authenticationService.getUserFromLocalCache()?.username
    const formData = this.userService.createUserFormData(this.currentUsername, this.editUser, this.profileImage);
    this.subscriptions.push(
      this.userService.updateUser(formData).subscribe(
        (response: User|any) => {
          this.authenticationService.addUserToLocalCache(response);
          this.getUsers(false);
          this.fileName = "";
          this.profileImage = null;
          this.sendNotification(NotificationType.SUCCESS,
            `${response.firstName} ${response.lastName} updated successfully`)
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.profileImage = null;
          this.refreshing = false;
        }
      )
    )
  }

  public onUpdateProfileImage(): void {
    const formData = new FormData();
    formData.append('username', this.user.username);
    formData.append('profileImage', this.profileImage);

    this.subscriptions.push(
      this.userService.updateProfileImage(formData).subscribe(
        (event: HttpEvent<any>) => {
          // console.log(event);
          this.reportUploadProgress(event);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.fileStatus.status = 'done';
        }
      )
    )
  }

  private reportUploadProgress(event: HttpEvent<any>): void {
      switch (event.type) {
        case HttpEventType.UploadProgress:
          if (event.total != null) {
            this.fileStatus.percentage = Math.round(100 * event.loaded / event.total);
            this.fileStatus.status = 'progress';
          } else {
            this.fileStatus.percentage = 0;
          }
          break;
        case HttpEventType.Response:
          if (event.status === 200) {
            this.user.profileImageUrl = `${event.body.profileImageUrl}?time=${new Date().getTime()}`;
            this.sendNotification(NotificationType.SUCCESS,
              `${event.body.firstName}\'s image profile updated successfully`)
              this.fileStatus.status = 'done';
          } else {
            this.sendNotification(NotificationType.ERROR,
              `Unable to upload image. Please try again`);
          }
          break;
        default:
          `Finish all processes`;
      }

      console.log(this.fileStatus.status);
      console.log(this.fileStatus.percentage);
      
      
  }

  public updateProfileImage(): void {
    this.clickButton('profile-image-input');
  }

  public onLogOut(): void {
      this.authenticationService.logout();
      this.router.navigate(["/login"]);
      this.sendNotification(NotificationType.SUCCESS, `You've been successfully logged out`)
  }

  public onResetPassword(emailForm: NgForm): void {
    this.refreshing = true;
    const emailAddress = emailForm.value['reset-password-email'];
    this.subscriptions.push(
      this.userService.resetPassword(emailAddress).subscribe(
        (response) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.WARNING, errorResponse.error.message);
          this.profileImage = null;
        },
        () => emailForm.reset() //finally section, will be executed always
      )
    )
  }

  // public onDeleteUser(userId: number):void {
  public onDeleteUser(username: string):void {
    this.subscriptions.push(
      this.userService.deleteUser(username).subscribe(
        (response) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.getUsers(false);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.profileImage = null;
        }
      )
    )
  }

  public onEditUser(editUser: User): void {
    this.editUser = editUser;
    this.currentUsername = editUser.username;
    this.clickButton('openUserEdit');
  }

  //getter
  public get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isAdminOrManager(): boolean {
    return this.isAdmin || this.getUserRole() === Role.MANAGER;
  }

  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().role;
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
    const cachedUser = this.authenticationService.getUserFromLocalCache();
    if (cachedUser !== null) {
      this.user = cachedUser;
    } else {
      this.user = new User(); // or any other default user object
    }
    this.getUsers(true);
  }
}