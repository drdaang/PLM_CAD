import { Routes } from '@angular/router';
import { authGuard } from './components/auth-guard/auth-guard';

export const routes: Routes = [
    {
        path: 'login',
        
        loadComponent: () => import('./components/login/login').then(m => m.Login)
    },
    {
        path:'dashboard',
        canActivate:[authGuard],
        loadComponent:()=>import('./components/dashboard/dashboard').then(m=>m.Dashboard)
    },
    {
        path:'profile',
        canActivate:[authGuard],
        loadComponent:()=>import('./components/profile/profile').then(m=>m.Profile)
    },
    {
        path:'signup',
        loadComponent:()=>import('./components/signup/signup').then(m=>m.Signup)
    },
    {
        path:'create-part',
        canActivate:[authGuard],
        loadComponent:()=>import('./components/create-part/create-part').then(m=>m.CreatePart)
    },
    {
        path:'parts/:id',
        canActivate:[authGuard],
        loadComponent:()=>import('./components/part-details/part-details').then(m=>m.PartDetailsComponent)
    },
    {
        path:'create-bom',
        canActivate:[authGuard],
        loadComponent:()=>import('./components/create-bom/create-bom').then(m=>m.CreateBom)
    },
    {
        path:'bom-details/:id',
        canActivate:[authGuard],
        loadComponent:()=>import('./components/bom-details/bom-details').then(m=>m.BomDetails)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];
