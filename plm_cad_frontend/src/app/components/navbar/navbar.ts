import { Component, inject,signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { computed } from '@angular/core';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './navbar.html',
  styleUrl:'./navbar.css'
})
export class Navbar {
  constructor(public authService:AuthService){}
  auth = inject(AuthService);
  router = inject(Router);
  currentUrl= signal(this.router.url)
  // isLoginPage=computed(()=>this.currentUrl()==='/login');
  // isSignupPage = computed(()=> this.currentUrl()==='/signup')

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
