import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { computed } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly http:HttpClient){}

  public _authenticated=signal<boolean>(!!localStorage.getItem("auth_token"));
  isAuthenticated=computed(()=>this._authenticated());
  


  login(email:string,password:string):Observable<any>{
    return this.http.post<{token:string}>(
      'http://localhost:8000/login',
      {email,password})
      .pipe(
        tap(res =>{
          localStorage.setItem('auth_token',res.token);
          console.log(res);
        })
      );
  }
   signup(username:string,email:string,password:string):Observable<any>{
      console.log("in auth signup")
      return this.http.post<{message:string}>(
        'http://localhost:8000/signup',
        {username,email,password})
        .pipe(
          tap(res=>{
            console.log(res.message)
          })
        ) 
    }


  logout(){
    this._authenticated.set(false);
    localStorage.removeItem("auth_token");
  }
}
