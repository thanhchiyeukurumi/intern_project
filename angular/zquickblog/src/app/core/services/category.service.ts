import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CATEGORY_API } from '../../core/constants/api-endpoints';
import { CategoryDto } from '../../shared/models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<any>(CATEGORY_API.BASE, { params: httpParams });
  }

  getById(id: number | string): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(CATEGORY_API.GET_BY_ID(id));
  }

  create(data: CategoryDto): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(CATEGORY_API.BASE, data);
  }

  update(id: number | string, data: Partial<CategoryDto>): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(CATEGORY_API.GET_BY_ID(id), data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete<any>(CATEGORY_API.GET_BY_ID(id));
  }
}
