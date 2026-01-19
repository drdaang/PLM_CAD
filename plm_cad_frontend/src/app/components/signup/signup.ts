import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { v4,UUIDTypes } from 'uuid';
import { FormControl,FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  UserSignup = new FormGroup(
    {
      userName: new FormControl(''),
      email: new FormControl(''),
      password: new FormControl('')
    }
  );
  constructor( private readonly router: Router, private readonly authService: AuthService) { }
  onSubmitSignup() {
    if (this.UserSignup.invalid) return;
    console.log("in submit func")
    const {userName, email, password } = this.UserSignup.value;
    
    this.authService.signup(userName!,email!, password!).subscribe(
      { next: () => {this.router.navigate(['/login']);},
        error:err=>console.error('Signup failed',err)
       }
    )
  }
}
