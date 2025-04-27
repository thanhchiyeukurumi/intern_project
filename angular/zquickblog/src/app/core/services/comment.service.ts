import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { COMMENT_API, POST_API, USER_API } from '../../core/constants/api-endpoints';
import { Comment, CommentDto } from '../../shared/models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  constructor(private http: HttpClient) {}

  getById(id: number | string): Observable<Comment> {
    return this.http.get<Comment>(COMMENT_API.GET_BY_ID(id));
  }

  getByPost(postId: number | string, params?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
  }): Observable<{ data: Comment[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<{ data: Comment[]; pagination: any }>(POST_API.GET_COMMENTS(postId), { params: httpParams });
  }

  getByUser(userId: number | string, params?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
  }): Observable<{ data: Comment[]; pagination: any }> {
    let httpParams = new HttpParams();
    if (params) {
      (Object.keys(params) as (keyof typeof params)[]).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value as any);
        }
      });
    }
    return this.http.get<{ data: Comment[]; pagination: any }>(USER_API.GET_COMMENTS_BY_USER(userId), { params: httpParams });
  }

  create(postId: number | string, data: CommentDto): Observable<Comment> {
    return this.http.post<Comment>(POST_API.ADD_COMMENT(postId), data);
  }

  update(id: number | string, data: Partial<CommentDto>): Observable<Comment> {
    return this.http.put<Comment>(COMMENT_API.UPDATE(id), data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete<any>(COMMENT_API.DELETE(id));
  }
}
