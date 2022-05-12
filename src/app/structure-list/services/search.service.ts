import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {Category, Module} from '@gouvfr-anct/mediation-numerique';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private http: HttpClient) {}

  public getCategoriesTraining(): Observable<Category[]> {
    return this.http
      .get('/api/categories/categoriesFormations')
      .pipe(map((data: any[]) => data.map((item) => new Category(item))));
  }
  public getCategoriesAccompaniment(): Observable<Category[]> {
    return this.http
      .get('/api/categories/categoriesAccompagnement')
      .pipe(map((data: any[]) => data.map((item) => new Category(item))));
  }
  public getCategoriesOthers(): Observable<Category[]> {
    return this.http
      .get('/api/categories/categoriesOthers')
      .pipe(map((data: any[]) => data.map((item) => new Category(item))));
  }
  public getIndex(array: Module[], id: string, categ: string): number {
    return array.findIndex((m: Module) => m.id === id && m.text === categ);
  }
}
