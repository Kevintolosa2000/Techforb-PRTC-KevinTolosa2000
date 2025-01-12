import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PlantsService {

  constructor(private http: HttpClient) { }

  getPlantsByUserID(id: string): Observable<any> {
    return this.http.get(environment.GET_PLANTS_BY_USER_ID + id);
  }

  getPlantByID(id: string): Observable<any> {
    return this.http.get(environment.GET_PLANT_BY_ID + id);
  }

  getCategoriesByID(id: string): Observable<any> {
    return this.http.get(environment.GET_CATEGORIES_BY_PLANT_ID + id);
  }
  
  deletePlant(id: string): Observable<any> {
    return this.http.delete(environment.DELETE_PLANT + id);
  }

  createPlant(plant: any): Observable<any> {
    return this.http.post(environment.CREATE_PLANT, plant);
  }

  updatePlant(id: string, plant: any): Observable<any> {
    return this.http.put(environment.UPDATE_PLANT + id, plant, { observe: 'response' });
  }

  updateCategory(id: string, category: any): Observable<any> {
    return this.http.put(environment.UPDATE_CATEGORY + id, category, { observe: 'response' });
  }
}
