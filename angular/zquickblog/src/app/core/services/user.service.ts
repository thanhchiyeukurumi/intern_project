import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { USER_API } from '../../core/constants/api-endpoints';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
    includeRelations: boolean;
  }): Observable<{ data: User[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<{ data: User[]; pagination: any }>(USER_API.BASE, { params: httpParams });
  }

  getById(id: number | string): Observable<User> {
    return this.http.get<User>(USER_API.GET_BY_ID(id));
  }

  create(data: Partial<User>): Observable<User> {
    return this.http.post<User>(USER_API.BASE, data);
  }

  update(id: number | string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(USER_API.GET_BY_ID(id), data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete<any>(USER_API.GET_BY_ID(id));
  }
}
