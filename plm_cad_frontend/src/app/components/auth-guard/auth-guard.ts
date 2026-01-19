import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  if (token) {
    return true;
  }

  // Not logged in → redirect
  void router.navigate(['/login']);
  return false;
};