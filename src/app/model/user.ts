export class User {
    public id: number;
    public userId: string;
    public firstName: string;
    public lastName: string;
    public username: string;
    public email: string;
    public logInDateDisplay: Date;
    public joinDate: Date;
    public profileImageUrl: string;
    public active: boolean;
    public notLocked: boolean;
    public role: string;
    public authorities: any[];
  
    constructor() {
      this.id = 0;
      this.userId = '';
      this.firstName = '';
      this.lastName = '';
      this.username = '';
      this.email = '';
      this.logInDateDisplay = new Date(); // Initialize the property with a default value
      this.joinDate = new Date(); // Initialize the property with a default value
      this.profileImageUrl = '';
      this.active = false;
      this.notLocked = false;
      this.role = '';
      this.authorities = [];
    }
  }
  