import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Part } from '../models/part';
import { Observable, tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class PartService {
  private readonly baseUrl = 'http://localhost:8000';
  constructor(private readonly http:HttpClient){}
    createPart(formValue:any):Observable<{message:string}>{

      const token = localStorage.getItem('auth_token')!;
      const params= new HttpParams().set('token',token)
      const formData = new FormData();
      formData.append('name',formValue.name);
      formData.append('partNumber',formValue.partNumber);
      formData.append('description',formValue.description??'');
      if(formValue.PartFile){
        formData.append('PartFile',formValue.PartFile);
      }

      
      return this.http.post<{message:string}>('http://localhost:8000/create-part',formData,
        {
          headers:{
            Authorization:`Bearer ${token}`
          },
          params
        }
      ).pipe(
        tap(res=>{
          console.log(res.message)
        })
      )
    }

  getPartById(id: string): Observable<any> {
    const token = localStorage.getItem('auth_token')!;

    if (!id) {
      throw new Error('Part ID is required');
    }

    return this.http.get<any>(
      `${this.baseUrl}/parts/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  }
  show_dashboard(){
      return this.http.get('http://localhost:8000/dashboard')
  }

  get_bom_details(){
      console.log("In part service get_bom_details")
      return this.http.get('http://localhost:8000/create-bom')
  }

  create_bom(formValue:any):Observable<{message:string}>{
    console.log("In part service create_bom",formValue)
      const token = localStorage.getItem('auth_token')!;
      const params= new HttpParams().set('token',token)
      return this.http.post<{message:string}>('http://localhost:8000/create-bom',formValue,
        {
          headers:{
            Authorization:`Bearer ${token}`
          },
          params
        }
      )
  }

  get_bom_by_id(id:string):Observable<any>{
    const token = localStorage.getItem('auth_token')!;

    if (!id) {
      throw new Error('BOM ID is required');
    }
    return this.http.get<any>(
      `${this.baseUrl}/bom-details/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  }
}
