import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { QuillEditorComponent, SafeHtmlPipe } from '../../components/quill-editor/quill-editor.component';

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
  categories = [
    { label: 'Công nghệ', value: 'technology' },
    { label: 'Du lịch', value: 'travel' },
    { label: 'Ẩm thực', value: 'food' },
    { label: 'Sức khỏe', value: 'health' },
    { label: 'Giáo dục', value: 'education' }
  ];

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', Validators.required],
      categories: [[], Validators.required],
      tags: [''],
      featuredImage: [''],
      excerpt: ['', Validators.maxLength(300)]
    });
  }

  handleContentChange(content: string): void {
    console.log('Content changed:', content);
  }

  handleEditorCreated(editor: any): void {
    console.log('Editor created:', editor);
  }

  submitPost(): void {
    if (this.postForm.invalid) {
      // Đánh dấu tất cả các control là đã touched để hiển thị lỗi
      Object.values(this.postForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    
    // Mô phỏng API call
    setTimeout(() => {
      console.log('Submitted post:', this.postForm.value);
      this.message.success('Bài viết đã được lưu thành công!');
      this.isSubmitting = false;
      // Có thể đặt reset form hoặc chuyển hướng ở đây
      // this.postForm.reset();
    }, 1500);
  }
} 