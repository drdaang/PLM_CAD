import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
// import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  UserLogin = new FormGroup(
    {
      email: new FormControl(''),
      password: new FormControl('')
    }
  );
  constructor( private readonly router: Router, private readonly authService: AuthService) { }
  onSubmit() {
    if (this.UserLogin.invalid) return;

    const { email, password } = this.UserLogin.value;

    this.authService.login(email!, password!).subscribe(
      { next: () => {this.router.navigate(['/dashboard']);this.authService._authenticated.set(true)},
        error:err=>console.error('Login failed',err)
       }
    )
  }
}
