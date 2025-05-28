import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { QuillEditorComponent } from '../../components/quill-editor/quill-editor.component';
import { PostService } from '../../../../core/services/post.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CategoryService } from '../../../../core/services/category.service';
import { LanguageService } from '../../../../core/services/language.service';
import { Post, PostDto } from '../../../../shared/models/post.model';
import { Category } from '../../../../shared/models/category.model';
import { Language } from '../../../../shared/models/language.model';
import { User } from '../../../../shared/models/user.model';
import { Subscription, finalize } from 'rxjs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { POST_API } from '../../../../core/constants/api-endpoints';

@Component({
  selector: 'app-blogger-new-lan',
  templateUrl: './blogger-new-lan.component.html',
  styleUrls: ['./blogger-new-lan.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzGridModule,
    NzDividerModule,
    NzSpinModule,
    NzAlertModule,
    NzTabsModule,
    QuillEditorComponent,
    NzTagModule
  ]
})
export class BloggerNewLanComponent implements OnInit, OnDestroy {
  // Form và trạng thái
  translationForm!: FormGroup;
  isSubmitting = false;
  isLoadingData = true;
  
  // Dữ liệu bài viết gốc và các tùy chọn
  originalPost: Post | null = null;
  categoriesForSelect: { label: string, value: string | number }[] = [];
  languagesForSelect: { label: string, value: string | number }[] = [];
  usedLanguages: number[] = []; // IDs của các ngôn ngữ đã được sử dụng

  // Người dùng hiện tại
  private currentUser: User | null = null;
  
  // Quản lý subscriptions
  private subscriptions = new Subscription();
  private originalPostId: number | null = null;
  
  // ViewChild để truy cập Quill Editor
  @ViewChild('translationEditor') translationEditor!: QuillEditorComponent;

  // Inject các service
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private postService = inject(PostService);
  public router = inject(Router);
  private authService = inject(AuthService);
  private categoryService = inject(CategoryService);
  private languageService = inject(LanguageService);
  private activatedRoute = inject(ActivatedRoute);
  private http = inject(HttpClient);

  ngOnInit(): void {
    console.log('BloggerNewLanComponent đang khởi tạo...');
    this.initForm();

    // Kiểm tra xác thực người dùng
    const authSub = this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (!user || !user.id) {
          this.message.warning('Vui lòng đăng nhập để tạo bản dịch mới.');
          this.router.navigate(['/login']);
          this.isLoadingData = false;
          return;
        }
        
        // Lấy ID bài viết gốc từ URL
        const routeSub = this.activatedRoute.paramMap.subscribe(params => {
          const id = params.get('id');
          if (id) {
            this.originalPostId = +id;
            console.log('Đã lấy ID bài viết gốc từ URL:', this.originalPostId);
            this.loadCategoriesAndLanguages();
            this.loadOriginalPost(this.originalPostId);
          } else {
            console.log('Không tìm thấy ID bài viết gốc trong URL.');
            this.message.error('Không tìm thấy ID bài viết gốc.');
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
    console.error('Lỗi xác thực:', err);
    this.message.error('Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.');
    this.isLoadingData = false;
  }

  // Khởi tạo form
  initForm(): void {
    console.log('Khởi tạo form mới cho bản dịch');
    this.translationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      content: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      categories: [[], [Validators.required, Validators.minLength(1)]],
      language_id: [null, [Validators.required]],
      original_post_id: [{ value: null, disabled: true }]
    });
  }

  // Tải danh mục và ngôn ngữ
  loadCategoriesAndLanguages(): void {
    console.log('Đang tải danh mục và ngôn ngữ...');
    // Tải danh mục
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

    // Tải ngôn ngữ
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

  // Tải bài viết gốc
  private loadOriginalPost(postId: number): void {
    this.isLoadingData = true;
    console.log('Bắt đầu tải bài viết gốc với ID:', postId);
    
    // Lấy bài viết từ API với các thông tin liên quan
    const url = `${POST_API.GET_BY_ID(postId)}?includeRelations=true`;
    console.log('URL để lấy bài viết gốc:', url);

    const getPostSub = this.http.get<{ data: Post }>(url).pipe(
      finalize(() => {
        console.log('Hoàn tất quá trình tải bài viết gốc.');
        this.isLoadingData = false;
      })
    ).subscribe({
      next: (apiResponse) => {
        console.log('Đã nhận dữ liệu bài viết gốc từ API:', apiResponse);
        
        if (!apiResponse || !apiResponse.data) {
          this.message.error('Không tìm thấy bài viết gốc hoặc dữ liệu không hợp lệ.');
          this.router.navigate(['/blogger/posts']);
          return;
        }
        
        // Lưu bài viết gốc
        this.originalPost = apiResponse.data;
        console.log('Bài viết gốc:', this.originalPost);
        
        // Kiểm tra các bản dịch hiện có để lọc ra các ngôn ngữ đã được sử dụng
        this.loadExistingTranslations(postId);
        
        // Cập nhật giá trị form ban đầu từ bài viết gốc
        const categoryIds = this.originalPost.Categories ? this.originalPost.Categories.map(cat => cat.id) : [];
        
        this.translationForm.patchValue({
          title: this.originalPost.title || '',
          content: this.originalPost.content || '',
          description: this.originalPost.description || '',
          categories: categoryIds,
          original_post_id: this.originalPost.id
        });
        
        console.log('Đã cập nhật form với dữ liệu ban đầu từ bài viết gốc');
      },
      error: (err) => {
        console.error('Lỗi khi tải bài viết gốc:', err);
        this.message.error('Không thể tải dữ liệu bài viết gốc. Vui lòng thử lại.');
        this.router.navigate(['/blogger/posts']);
      }
    });
    this.subscriptions.add(getPostSub);
  }

  // Tải các bản dịch hiện có để lọc ra các ngôn ngữ đã được dùng
  private loadExistingTranslations(originalPostId: number): void {
    const translationsSub = this.postService.getPostsFromOriginal(originalPostId, {
      includeRelations: true
    }).subscribe({
      next: (response) => {
        const translations = response.data || [];
        console.log('Các bản dịch hiện có:', translations);
        
        // Lấy danh sách các ngôn ngữ đã được sử dụng
        this.usedLanguages = translations.map(post => post.language_id);
        
        // Thêm ngôn ngữ của bài viết gốc vào danh sách đã sử dụng
        if (this.originalPost && this.originalPost.language_id) {
          this.usedLanguages.push(this.originalPost.language_id);
        }
        
        console.log('Các ngôn ngữ đã được sử dụng:', this.usedLanguages);
      },
      error: (err) => {
        console.error('Lỗi khi tải các bản dịch hiện có:', err);
      }
    });
    this.subscriptions.add(translationsSub);
  }

  private handleLoadError(err: any, type: string): void {
    console.error(`Lỗi khi tải ${type}:`, err);
    this.message.error(`Không thể tải danh sách ${type}.`);
  }

  // Xử lý khi Quill Editor được khởi tạo
  handleEditorCreated(editor: any): void {
    console.log('Quill Editor đã được khởi tạo.', editor);
  }

  // Kiểm tra xem một ngôn ngữ đã được sử dụng chưa
  isLanguageUsed(languageId: number | string): boolean {
    // Đảm bảo languageId là số
    const numericId = typeof languageId === 'string' ? parseInt(languageId, 10) : languageId;
    return this.usedLanguages.includes(numericId);
  }

  // Gửi form để tạo bản dịch mới
  submitTranslation(): void {
    // Kiểm tra và đánh dấu lỗi trong form
    Object.values(this.translationForm.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });

    if (this.translationForm.invalid) {
      this.message.error('Vui lòng kiểm tra lại các trường thông tin còn thiếu hoặc không hợp lệ.');
      return;
    }

    if (!this.currentUser || !this.currentUser.id || !this.originalPostId) {
      this.message.error('Phiên làm việc không hợp lệ hoặc thiếu thông tin bài viết. Vui lòng thử lại.');
      if (!this.currentUser || !this.currentUser.id) this.router.navigate(['/login']);
      return;
    }

    this.isSubmitting = true;
    
    // Lấy nội dung từ Quill Editor
    const contentHtml = this.translationEditor && typeof this.translationEditor.getContent === 'function' 
                      ? (this.translationEditor.getContent().html || '') 
                      : (this.translationForm.get('content')?.value || '');

    const formValues = this.translationForm.getRawValue();

    // Tạo đối tượng dữ liệu để gửi lên API
    const translationData: PostDto = {
      title: formValues.title,
      content: contentHtml,
      description: formValues.description,
      categories: formValues.categories,
      language_id: formValues.language_id,
      original_post_id: this.originalPostId,
      status: 'published' // Mặc định trạng thái là published, có thể thay đổi tùy nhu cầu
    };

    console.log('Gửi dữ liệu bản dịch mới:', translationData);

    // Gọi API để tạo bản dịch mới
    this.postService.create(translationData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          console.log('Đã tạo bản dịch mới thành công:', response);
          this.message.success(`Đã tạo bản dịch mới thành công!`);
          this.router.navigate(['/blogger/posts']);
        },
        error: (err) => {
          console.error('Lỗi khi tạo bản dịch:', err);
          const backendError = err.error?.message || err.error?.error || err.message;
          this.message.error(`Lỗi: ${backendError || 'Không thể tạo bản dịch mới.'}`);
        }
      });
  }
} 