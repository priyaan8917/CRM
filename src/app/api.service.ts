import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
@Injectable({providedIn:'root'}) export class ApiService {
  private http=inject(HttpClient); csrf='';
  request<T=any>(path:string,method='GET',body?:unknown):Promise<T>{return firstValueFrom(this.http.request<T>(method,'/api/'+path,{body,headers:{'X-CSRF-Token':this.csrf}}));}
}
