import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { QuillEditorComponent } from '../../components/quill-editor/quill-editor.component';
import { PostService } from '../../../../core/services/post.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CategoryService } from '../../../../core/services/category.service';
import { LanguageService } from '../../../../core/services/language.service';
import { PostDto } from '../../../../shared/models/post.model';
import { Category } from '../../../../shared/models/category.model';
import { Language } from '../../../../shared/models/language.model';
import { User } from '../../../../shared/models/user.model';
import { Subscription, finalize } from 'rxjs';

@Component({
  selector: 'app-blogger-post-create',
  templateUrl: './blogger-post-create.component.html',
  styleUrls: ['./blogger-post-create.component.scss'],
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
    QuillEditorComponent
  ]
})
export class BloggerPostCreateComponent implements OnInit, OnDestroy {
  postForm!: FormGroup;
  isSubmitting = false;
  categoriesForSelect: { label: string, value: string | number }[] = [];
  languagesForSelect: { label: string, value: string | number }[] = [];
  private currentUser: User | null = null;
  private subscriptions = new Subscription();
  private originalPostIdFromQuery: number | null = null;
  @ViewChild(QuillEditorComponent) quillEditor!: QuillEditorComponent; // Truy cập QuillEditorComponent

  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private postService = inject(PostService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private categoryService = inject(CategoryService);
  private languageService = inject(LanguageService);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    const authSub = this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (!user || !user.id) {
          this.message.warning('Vui lòng đăng nhập để tạo bài viết.');
          this.router.navigate(['/login']);
        } else {
          const queryParamSub = this.activatedRoute.queryParamMap.subscribe(params => {
            const id = params.get('originalPostId');
            this.originalPostIdFromQuery = id ? +id : null;
            this.initForm();
          });
          this.subscriptions.add(queryParamSub);
        }
      },
      error: (err) => this.handleAuthError(err)
    });
    this.subscriptions.add(authSub);

    this.loadCategories();
    this.loadLanguages();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private handleAuthError(err: any): void {
    console.error('Error fetching current user:', err);
    this.message.error('Không thể xác thực người dùng. Vui lòng đăng nhập lại.');
    this.router.navigate(['/login']);
  }

  initForm(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      content: ['', Validators.required], // Lưu chuỗi HTML
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      categories: [[], [Validators.required, Validators.minLength(1)]],
      language_id: [null, Validators.required],
      original_post_id: [this.originalPostIdFromQuery]
    });

    if (this.originalPostIdFromQuery) {
      this.message.info(`Đang tạo bản dịch cho bài viết gốc ID: ${this.originalPostIdFromQuery}. Một số trường có thể được điền sẵn hoặc khóa.`);
    }
  }

  loadCategories(): void {
    const catSub = this.categoryService.getAll({ limit: 100, orderBy: 'name', order: 'ASC' }).subscribe({
      next: (response) => {
        this.categoriesForSelect = (response.data || []).map((cat: Category) => ({
          label: cat.name,
          value: cat.id
        }));
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.message.error('Không thể tải danh sách danh mục.');
      }
    });
    this.subscriptions.add(catSub);
  }

  loadLanguages(): void {
    const langSub = this.languageService.getAll({ orderBy: 'name', order: 'ASC' }).subscribe({
      next: (response) => {
        this.languagesForSelect = (response.data || []).map((lang: Language) => ({
          label: lang.name,
          value: lang.id
        }));
      },
      error: (err) => {
        console.error('Error loading languages:', err);
        this.message.error('Không thể tải danh sách ngôn ngữ.');
      }
    });
    this.subscriptions.add(langSub);
  }

  handleEditorCreated(editor: any): void {
    // console.log('Editor created:', editor);
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

    if (!this.currentUser || !this.currentUser.id) {
      this.message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      this.router.navigate(['/login']);
      return;
    }

    this.isSubmitting = true;

    // Lấy chuỗi HTML từ QuillEditorComponent
    const contentHtml = this.quillEditor.getContent().html || '';

    const formValues = this.postForm.value;
    const postData: PostDto = {
      title: formValues.title,
      content: contentHtml, // Gửi chuỗi HTML
      description: formValues.description,
      categories: formValues.categories,
      language_id: formValues.language_id,
      original_post_id: formValues.original_post_id || null,
      status: 'draft'
    };

    console.log('Submitting Post DTO:', postData);

    this.postService.create(postData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          this.message.success(`Bài viết "${response.title}" đã được tạo thành công!`);
          this.postForm.reset({
            original_post_id: this.originalPostIdFromQuery
          });
          this.router.navigate(['/blogger/posts']);
        },
        error: (err) => {
          console.error('Lỗi khi tạo bài viết:', err);
          const backendError = err.error?.message || err.error?.error;
          this.message.error(`Lỗi: ${backendError || err.message || 'Không thể tạo bài viết.'}`);
        }
      });
  }
}