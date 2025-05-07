import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UPLOAD_API } from '../constants/api-endpoints'; // Điều chỉnh đường dẫn nếu cần

// --- Định nghĩa các kiểu dữ liệu trả về dựa trên backend của bạn ---

/**
 * Thông tin file chung sau khi upload lên Cloudinary (hoặc local).
 * Dựa trên cấu trúc trả về từ `uploadService.processCloudinaryUpload` hoặc `processLocalUpload`.
 */
export interface UploadedFileResponse {
  url: string;
  publicId?: string; // Có với Cloudinary
  originalName: string;
  size: number;
  format: string;
  type: string; // 'image', 'avatar', 'gallery', 'editor', etc.
  width?: number;
  height?: number;
  createdAt: string; // ISO date string
  // Các trường khác nếu có từ `processLocalUpload`
  path?: string;
  filename?: string;
}

/**
 * Cấu trúc response chung từ API (dựa trên responseUtils `ok`, `created`).
 */
export interface ApiResponse<TData = any> {
  status: 'success' | 'created' | 'ok' | string; // Có thể thêm các status khác từ responseUtils
  message: string;
  data: TData;
  // pagination?: any; // Nếu có
}

/**
 * Cấu trúc response đặc biệt cho QuillJS editor upload.
 * Dựa trên `UploadController.uploadEditorImage`.
 */
export interface QuillUploadSuccessResponse {
  success: 1;
  file: {
    url: string;
    alt?: string; // Thêm alt nếu backend `processEditorUpload` có trả về
  };
  error?: string; // Nếu có lỗi, sẽ không có trường này
}

export interface QuillUploadErrorResponse {
  success: 0;
  error: string;
}

export type QuillUploadResponse = QuillUploadSuccessResponse | QuillUploadErrorResponse;

/**
 * Kết quả từ việc xóa file trên Cloudinary.
 * Dựa trên `cloudinary.uploader.destroy`.
 */
export interface DeleteFileResult {
  result: 'ok' | 'not found' | string; // 'ok' là thành công
  // Có thể có các trường khác tùy theo response từ Cloudinary
}


@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private http: HttpClient) {}

  /**
   * Upload một file ảnh (ví dụ: avatar, thumbnail).
   * @param file File cần upload.
   * @param type Loại file (ví dụ: 'avatar', 'thumbnail'), sẽ được gửi trong FormData. Backend của bạn đọc từ `req.body.type`.
   * @returns Observable chứa thông tin file đã upload.
   */
  uploadSingleImage(file: File, type?: string): Observable<ApiResponse<UploadedFileResponse>> {
    const formData = new FormData();
    formData.append('image', file, file.name); // Backend `uploadMiddleware.uploadSingleImage` dùng field 'image'
    if (type) {
      formData.append('type', type);
    }
    // HttpClient tự động set Content-Type là multipart/form-data khi body là FormData.
    // Token JWT nên được xử lý bởi một HttpInterceptor.
    return this.http.post<ApiResponse<UploadedFileResponse>>(UPLOAD_API.UPLOAD_IMAGE, formData);
  }

  /**
   * Upload nhiều file ảnh.
   * @param files Mảng các File cần upload.
   * @param type Loại file (ví dụ: 'gallery'), sẽ được gửi trong FormData. Backend của bạn đọc từ `req.body.type`.
   * @returns Observable chứa mảng thông tin các file đã upload.
   */
  uploadMultipleImages(files: File[], type?: string): Observable<ApiResponse<UploadedFileResponse[]>> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file, file.name); // Backend `uploadMiddleware.uploadMultipleImages` dùng field 'images'
    });
    if (type) {
      formData.append('type', type);
    }
    return this.http.post<ApiResponse<UploadedFileResponse[]>>(UPLOAD_API.UPLOAD_IMAGES, formData);
  }

  /**
   * Upload file ảnh từ trình soạn thảo QuillJS.
   * @param file File cần upload.
   * @param type (Tùy chọn) Loại file (ví dụ: 'editor-post'). Backend `uploadEditorImage` cũng đọc `req.body.type`.
   * @returns Observable chứa response đặc thù cho Quill.
   */
  uploadEditorImage(file: File, type?: string): Observable<QuillUploadResponse> {
    const formData = new FormData();
    formData.append('upload', file, file.name); // Backend `uploadMiddleware.uploadEditorImage` dùng field 'upload'
    if (type) {
      formData.append('type', type);
    }
    // Endpoint này trả về cấu trúc JSON khác với các upload khác
    return this.http.post<QuillUploadResponse>(UPLOAD_API.UPLOAD_EDITOR, formData);
  }

  /**
   * Xóa một file đã upload dựa vào publicId của nó (thường là từ Cloudinary).
   * @param publicId Public ID của file cần xóa.
   * @returns Observable chứa kết quả xóa.
   */
  deleteFile(publicId: string): Observable<ApiResponse<DeleteFileResult>> {
    return this.http.delete<ApiResponse<DeleteFileResult>>(UPLOAD_API.DELETE_FILE(publicId));
  }

  // ----- Các phương thức upload lên LOCAL (nếu bạn có endpoint riêng cho chúng) -----
  // Backend của bạn đã có `uploadMiddleware.uploadSingleImageLocal` etc.
  // Nếu bạn tạo các route API sử dụng chúng, bạn có thể thêm các method tương ứng ở đây.
  // Ví dụ:
  // uploadSingleImageLocal(file: File, type?: string): Observable<ApiResponse<UploadedFileResponse>> {
  //   const formData = new FormData();
  //   formData.append('image', file, file.name);
  //   if (type) {
  //     formData.append('type', type);
  //   }
  //   // Giả sử bạn có endpoint '/uploads/local/image'
  //   return this.http.post<ApiResponse<UploadedFileResponse>>(`${UPLOAD_API.BASE}/local/image`, formData);
  // }
}