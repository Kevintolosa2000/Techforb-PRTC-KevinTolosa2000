import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  constructor(private http: HttpClient) { }

  getUserById(id: string): Observable<any> {
    return this.http.get(environment.GET_USER_BY_ID + id);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(environment.DELETE_USER_URL + id);
  }

  register(user: any): Observable<any> {
    return this.http.post(environment.REGISTER_URL, user);
  }

  login(user: any): Observable<any> {
    return this.http.post(environment.LOGIN_URL, user, { observe: 'response' });
  }
}