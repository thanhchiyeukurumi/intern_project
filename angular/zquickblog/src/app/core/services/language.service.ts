import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LANGUAGE_API } from '../../core/constants/api-endpoints';
import { LanguageDto, Language } from '../../shared/models/language.model';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  constructor(private http: HttpClient) {}

  getAll(params?: {
    orderBy?: string;
    order?: 'ASC' | 'DESC';
  }): Observable<{ data: Language[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<{ data: Language[]; pagination: any }>(LANGUAGE_API.BASE, { params: httpParams });
  }

  getById(id: number | string): Observable<Language> {
    return this.http.get<Language>(LANGUAGE_API.GET_BY_ID(id));
  }

  create(data: LanguageDto): Observable<Language> {
    return this.http.post<Language>(LANGUAGE_API.BASE, data);
  }

  update(id: number | string, data: Partial<LanguageDto>): Observable<Language> {
    return this.http.put<Language>(LANGUAGE_API.GET_BY_ID(id), data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete<any>(LANGUAGE_API.GET_BY_ID(id));
  }
}
