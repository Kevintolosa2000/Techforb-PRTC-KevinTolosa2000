import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  constructor(private http: HttpClient) { }

  getCountryByName(name: string): Observable<any> {
    return this.http.get(environment.GET_COUNTRY_BY_NAME + name);
  }

  getAllCountries(): Observable<any> {
    return this.http.get(environment.GET_ALL_COUNTRY);
  }
}
