import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Giữ lại nếu bạn dùng trực tiếp http.get ở đây
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { QuillEditorComponent } from '../../components/quill-editor/quill-editor.component';
import { PostService } from '../../../../core/services/post.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CategoryService } from '../../../../core/services/category.service';
import { LanguageService } from '../../../../core/services/language.service';
import { Post, PostDto } from '../../../../shared/models/post.model';
import { Category } from '../../../../shared/models/category.model';
import { Language } from '../../../../shared/models/language.model';
import { User } from '../../../../shared/models/user.model';
import { Subscription, finalize, tap } from 'rxjs'; // Bỏ switchMap vì đã đơn giản hóa
import { POST_API } from '../../../../core/constants/api-endpoints'; // Cần thiết nếu dùng URL trực tiếp

// Định nghĩa interface cho response API (tùy chọn nhưng nên có)
interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
  success?: boolean;
}

@Component({
  selector: 'app-blogger-post-edit',
  templateUrl: './blogger-post-edit.component.html',
  styleUrls: ['./blogger-post-edit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzGridModule,
    NzDividerModule,
    NzSpinModule,
    QuillEditorComponent
  ]
})
export class BloggerPostEditComponent implements OnInit, OnDestroy {
  postForm!: FormGroup;
  isSubmitting = false;
  isLoadingData = true;
  categoriesForSelect: { label: string, value: string | number }[] = [];
  languagesForSelect: { label: string, value: string | number }[] = [];
  private currentUser: User | null = null;
  private subscriptions = new Subscription();
  private postId: number | null = null;
  currentPost: Post | null = null; // Để public để template có thể truy cập

  @ViewChild(QuillEditorComponent) quillEditor!: QuillEditorComponent;

  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private postService = inject(PostService); // Sử dụng PostService thay vì http trực tiếp nếu getById đã hỗ trợ options
  router = inject(Router); // Để public nếu template dùng
  private authService = inject(AuthService);
  private categoryService = inject(CategoryService);
  private languageService = inject(LanguageService);
  private activatedRoute = inject(ActivatedRoute);
  private http = inject(HttpClient); // Giữ lại nếu POST_API.GET_BY_ID vẫn được dùng trực tiếp

  ngOnInit(): void {
    console.log('BloggerPostEditComponent đang khởi tạo...');
    this.initForm();

    const authSub = this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (!user || !user.id) {
          this.message.warning('Vui lòng đăng nhập để chỉnh sửa bài viết.');
          this.router.navigate(['/login']);
          this.isLoadingData = false; // Ngừng loading nếu không xác thực
          return;
        }
        console.log('Người dùng đã xác thực, bắt đầu lấy param...');
        
        const routeSub = this.activatedRoute.paramMap.subscribe(params => {
          const id = params.get('id');
          if (id) {
            this.postId = +id;
            console.log('Đã lấy ID bài viết từ URL:', this.postId);
            this.loadCategoriesAndLanguages(); // Tải trước hoặc song song
            this.loadPostData(this.postId);
          } else {
            console.log('Không tìm thấy ID bài viết trong URL.');
            this.message.error('Không tìm thấy ID bài viết.');
            this.router.navigate(['/blogger/posts']);
            this.isLoadingData = false;
          }
        });
        this.subscriptions.add(routeSub);
      },
      error: (err) => {
        console.error('Lỗi từ authService.currentUser$:', err);
        this.handleAuthError(err);
      }
    });
    this.subscriptions.add(authSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private handleAuthError(err: any): void {
    console.error('Error during authentication or initialization:', err);
    this.message.error('Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.');
    this.isLoadingData = false;
    // Không điều hướng ở đây nếu lỗi không phải từ việc user không tồn tại
  }

  initForm(): void {
    console.log('Khởi tạo form mới');
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      content: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      categories: [[], [Validators.required, Validators.minLength(1)]],
      language_id: [null, Validators.required],
      original_post_id: [{ value: null, disabled: true }]
    });
  }

  loadCategoriesAndLanguages(): void {
    console.log('Đang tải danh mục và ngôn ngữ...');
    const categoriesSub = this.categoryService.getAll({ limit: 100, orderBy: 'name', order: 'ASC' }).subscribe({
      next: (response) => {
        this.categoriesForSelect = (response.data || []).map((cat: Category) => ({
          label: cat.name,
          value: cat.id
        }));
        console.log('Đã tải', this.categoriesForSelect.length, 'danh mục');
      },
      error: (err) => this.handleLoadError(err, 'danh mục')
    });

    const languagesSub = this.languageService.getAll({ orderBy: 'name', order: 'ASC' }).subscribe({
      next: (response) => {
        this.languagesForSelect = (response.data || []).map((lang: Language) => ({
          label: lang.name,
          value: lang.id
        }));
        console.log('Đã tải', this.languagesForSelect.length, 'ngôn ngữ');
      },
      error: (err) => this.handleLoadError(err, 'ngôn ngữ')
    });

    this.subscriptions.add(categoriesSub);
    this.subscriptions.add(languagesSub);
  }

  private loadPostData(postId: number): void {
    this.isLoadingData = true;
    console.log('Bắt đầu gọi loadPostData với ID:', postId);
    
    // Sử dụng URL trực tiếp nếu PostService.getById không hỗ trợ includeRelations hoặc trả về cấu trúc khác
    const url = `${POST_API.GET_BY_ID(postId)}?includeRelations=true`;
    console.log('URL cho HTTP GET:', url);

    // Sử dụng this.http.get<ApiResponse<Post>> nếu bạn đã định nghĩa interface ApiResponse
    // Hoặc this.http.get<any> và xử lý thủ công như dưới
    const getPostSub = this.http.get<ApiResponse<Post>>(url).pipe(
    // const getPostSub = this.http.get<any>(url).pipe( // Hoặc dùng any nếu không muốn tạo Interface
      tap(
        response => console.log('HTTP GET response received (trong tap):', response),
        error => console.error('HTTP GET error (trong tap):', error)
      ),
      finalize(() => {
        console.log('HTTP GET finalize được gọi.');
        this.isLoadingData = false;
      })
    ).subscribe({
      next: (apiResponse) => { // response từ API có dạng { data: Post, ...}
        console.log('Đã nhận dữ liệu từ API (trong subscribe.next):', apiResponse);
        
        if (!apiResponse || !apiResponse.data) {
          this.message.error('Không tìm thấy bài viết hoặc dữ liệu không hợp lệ từ API.');
          this.router.navigate(['/blogger/posts']);
          return;
        }
        
        const postData = apiResponse.data; // Dữ liệu bài viết nằm trong response.data
        this.currentPost = postData;
        
        console.log('Tiêu đề:', postData.title);
        console.log('Nội dung:', postData.content ? `Có nội dung (dài ${postData.content.length} ký tự)` : 'Không có nội dung');
        console.log('Danh mục từ API (trong data):', postData.Categories); 
        console.log('Ngôn ngữ từ API (trong data):', postData.Language);   
        console.log('Mô tả:', postData.description);
        
        // API của bạn trả về postData.Categories và postData.Language (chữ hoa)
        const categoryIds = postData.Categories ? postData.Categories.map(cat => cat.id) : [];
        const langId = postData.Language ? postData.Language.id : (postData.language_id || null);

        console.log('Danh mục IDs sẽ patch:', categoryIds);
        console.log('Language ID sẽ patch:', langId);
        
        if (!this.postForm) {
          console.error('Form chưa được khởi tạo!');
          this.initForm(); // Khởi tạo lại nếu chưa có, mặc dù đã gọi ở ngOnInit
        }
        
        try {
          this.postForm.patchValue({
            title: postData.title || '',
            content: postData.content || '', // Quill editor sẽ nhận giá trị này
            description: postData.description || '',
            categories: categoryIds,
            language_id: langId,
            original_post_id: postData.original_post_id
          });
          console.log('Đã cập nhật form với dữ liệu:', this.postForm.value);
          
          // Trigger cập nhật cho Quill editor nếu patchValue không đủ mạnh (ít khi cần)
          // if (this.quillEditor && postData.content) {
          //   this.quillEditor.writeValue(postData.content);
          // }

          if (postData.original_post_id) {
            this.message.info(`Đang chỉnh sửa bản dịch cho bài viết gốc ID: ${postData.original_post_id}.`);
          }
        } catch (error) {
          console.error('Lỗi khi cập nhật form:', error);
        }
      },
      error: (err) => {
        console.error('Lỗi từ HTTP GET (trong subscribe.error):', err);
        this.message.error('Không thể tải dữ liệu bài viết. Vui lòng thử lại.');
        // Cân nhắc không điều hướng ở đây để người dùng không mất context nếu chỉ là lỗi tạm thời
        // this.router.navigate(['/blogger/posts']); 
      }
    });
    this.subscriptions.add(getPostSub);
  }

  private handleLoadError(err: any, type: string): void {
    console.error(`Error loading ${type}:`, err);
    this.message.error(`Không thể tải danh sách ${type}.`);
  }

  handleEditorCreated(editor: any): void {
    console.log('Quill Editor đã được khởi tạo.', editor);
    // Thường thì không cần làm gì ở đây nếu formControlName hoạt động đúng
    // Nếu `patchValue` không cập nhật editor, bạn có thể thử:
    // if (this.currentPost && this.currentPost.content && this.quillEditor) {
    //   setTimeout(() => this.quillEditor.writeValue(this.currentPost!.content), 0);
    // }
  }

  submitPost(): void {
    Object.values(this.postForm.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });

    if (this.postForm.invalid) {
      this.message.error('Vui lòng kiểm tra lại các trường thông tin còn thiếu hoặc không hợp lệ.');
      return;
    }

    if (!this.currentUser || !this.currentUser.id || !this.postId) {
      this.message.error('Phiên làm việc không hợp lệ hoặc thiếu thông tin bài viết. Vui lòng thử lại.');
      if(!this.currentUser || !this.currentUser.id) this.router.navigate(['/login']);
      return;
    }

    this.isSubmitting = true;
    // Lấy nội dung từ Quill Editor một cách an toàn
    const contentHtml = this.quillEditor && typeof this.quillEditor.getContent === 'function' 
                        ? (this.quillEditor.getContent().html || '') 
                        : (this.postForm.get('content')?.value || ''); // Fallback nếu quillEditor chưa sẵn sàng

    const formValues = this.postForm.getRawValue();

    const postDataToUpdate: Partial<PostDto> = {
      title: formValues.title,
      content: contentHtml,
      description: formValues.description,
      categories: formValues.categories,
      language_id: formValues.language_id,
      // original_post_id không được gửi khi update
      // status có thể được thêm ở đây nếu cần
    };

    console.log('Submitting Post DTO for update:', postDataToUpdate);

    this.postService.update(this.postId, postDataToUpdate)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          // Giả sử service.update cũng trả về { data: Post }
        //   const updatedPostTitle = response.data ? response.data.title : (response.title || 'Bài viết');
        //   this.message.success(`Bài viết "${updatedPostTitle}" đã được cập nhật thành công!`);
          this.router.navigate(['/blogger/posts']);
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật bài viết:', err);
          const backendError = err.error?.message || err.error?.error || err.message;
          this.message.error(`Lỗi: ${backendError || 'Không thể cập nhật bài viết.'}`);
        }
      });
  }
}