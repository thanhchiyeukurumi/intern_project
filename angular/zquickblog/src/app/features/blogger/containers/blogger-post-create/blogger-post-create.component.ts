import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { Category } from '../../../../shared/models/category.model';
import { PostDto } from '../../../../shared/models/post.model';

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
export class BloggerPostCreateComponent implements OnInit {
  postForm!: FormGroup;
  isSubmitting = false;
  categories: { label: string, value: string | number }[] = [
    { label: 'Công nghệ', value: '1' },
    { label: 'Du lịch', value: '2' },
    { label: 'Ẩm thực', value: '3' },
    { label: 'Sức khỏe', value: '4' },
    { label: 'Giáo dục', value: '5' }
  ];

  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private postService = inject(PostService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private currentUser: any = null;

  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (!user || !user.id) {
          this.message.warning('Vui lòng đăng nhập để tạo bài viết.');
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('Error fetching current user:', err);
        this.message.error('Không thể xác thực người dùng. Vui lòng đăng nhập lại.');
        this.router.navigate(['/login']);
      }
    });

    this.initForm();
    this.loadCategories();
  }

  initForm(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      content: [null, Validators.required], // Delta object
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]], // Maps to excerpt
      categories: [[], [Validators.required, Validators.minLength(1)]],
      language_id: [null, Validators.required], // Required by backend
      tags: [''],
      original_post_id: [null]
    });
  }

  loadCategories(): void {
    // Placeholder for API call
    // this.categoryService.getAll({ limit: 100 }).subscribe({
    //   next: (response) => {
    //     this.categories = response.data.map((cat: Category) => ({
    //       label: cat.name,
    //       value: cat.id
    //     }));
    //   },
    //   error: (err) => {
    //     console.error('Error loading categories:', err);
    //     this.message.error('Không thể tải danh sách danh mục.');
    //   }
    // });
  }

  handleEditorCreated(editor: any): void {
    console.log('Editor created:', editor);
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
      this.message.error('Vui lòng đăng nhập để tạo bài viết.');
      this.router.navigate(['/login']);
      return;
    }

    this.isSubmitting = true;

    const formData: PostDto = {
      title: this.postForm.value.title,
      content: JSON.stringify(this.postForm.value.content), // Serialize Delta to JSON string
      description: this.postForm.value.description,
      categories: this.postForm.value.categories, // Backend expects 'categories'
      language_id: this.postForm.value.language_id,
      original_post_id: this.postForm.value.original_post_id,
      user_id: this.currentUser.id, // Include user_id
      views: 0, // Default value
      expand: false, // Default value
      slug: undefined, // Let backend generate
      translations: undefined,
      originalPost: undefined
    };

    console.log('Submitting post data:', formData);

    this.postService.create(formData)
      .subscribe({
        next: (response) => {
          this.message.success('Bài viết đã được tạo thành công!');
          this.isSubmitting = false;
          this.postForm.reset({
            title: '',
            content: null,
            description: '',
            categories: [],
            language_id: null,
            tags: '',
            original_post_id: null
          });
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Lỗi khi tạo bài viết:', err);
          this.message.error(`Lỗi: ${err.error?.message || err.message || 'Không thể tạo bài viết.'}`);
          this.isSubmitting = false;
        }
      });
  }
}