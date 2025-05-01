import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { POST_API } from '../../core/constants/api-endpoints';
import { Post, PostDto } from '../../shared/models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(private http: HttpClient) {}

  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string | number;
    languageId?: string | number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
    includeRelations?: boolean;
  }): Observable<{ data: Post[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<{ data: Post[]; pagination: any }>(POST_API.BASE, { params: httpParams });
  }

  getById(id: number | string): Observable<Post> {
    return this.http.get<Post>(POST_API.GET_BY_ID(id));
  }

  create(data: PostDto): Observable<Post> {
    return this.http.post<Post>(POST_API.BASE, data);
  }

  update(id: number | string, data: Partial<PostDto>): Observable<Post> {
    return this.http.put<Post>(POST_API.GET_BY_ID(id), data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete<any>(POST_API.GET_BY_ID(id));
  }

  search(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string | number;
    languageId?: string | number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
  }): Observable<{ data: Post[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<{ data: Post[]; pagination: any }>(POST_API.SEARCH, { params: httpParams });
  }

  getByCategory(categoryId: number | string, params?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
  }): Observable<{ data: Post[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<{ data: Post[]; pagination: any }>(POST_API.GET_BY_CATEGORY(categoryId), { params: httpParams });
  }

  getByUser(userId: number | string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string | number;
    languageId?: string | number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
    includeRelations?: boolean;
  }): Observable<{ data: Post[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<{ data: Post[]; pagination: any }>(POST_API.GET_BY_USER(userId), { params: httpParams });
  }
}
