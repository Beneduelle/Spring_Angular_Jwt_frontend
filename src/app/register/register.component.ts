import { Component } from '@angular/core';
import { User } from '../model/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  public showLoading = false;

  public onRegister(user: User): void {

  }
}
