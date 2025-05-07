// quill-editor.component.ts
import { Component, forwardRef, ElementRef, ViewChild, AfterViewInit, Input, Output, EventEmitter, inject } from '@angular/core'; // Thêm inject
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';
// Bỏ QuillModule vì chúng ta đang tự khởi tạo Quill
// import { QuillModule } from 'ngx-quill';

// --- IMPORT CHO UPLOAD SERVICE ---
import { UploadService, QuillUploadResponse } from '../../../../core/services/upload.service'; // <-- ĐIỀU CHỈNH ĐƯỜNG DẪN CHO ĐÚNG
import { NzMessageService } from 'ng-zorro-antd/message'; // <-- Thêm NzMessageService

// SafeHtml Pipe - định nghĩa trực tiếp để tránh lỗi import
@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}

@Component({
  selector: 'app-quill-editor',
  templateUrl: './quill-editor.component.html',
  styleUrls: ['./quill-editor.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    NzTabsModule,
    NzEmptyModule,
    SafeHtmlPipe,
    // QuillModule // Bỏ đi nếu tự khởi tạo
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuillEditorComponent),
      multi: true
    },
    // Không cần provider UploadService ở đây vì nó là root-provided
  ]
})
export class QuillEditorComponent implements ControlValueAccessor, AfterViewInit {
  @ViewChild('editor') editorElement!: ElementRef;
  @Input() placeholder = 'Bắt đầu viết bài của bạn tại đây...';
  @Input() readOnly = false;
  @Input() minHeight = '300px';
  @Output() editorCreated = new EventEmitter<any>();
  @Output() contentChanged = new EventEmitter<{ html: string, delta: any }>(); // <-- Sửa để trả về cả HTML và Delta

  editor: any; // Instance của Quill
  quillModule: any; // Module Quill đã import
  content: string = ''; // HTML content
  deltaContent: any = null; // Delta content
  disabled: boolean = false;
  onChange: any = () => {};
  onTouched: any = () => {};
  activeTab = 0;
  previewContent: string = '';
  isLoading = false;

  // --- INJECT SERVICES ---
  private uploadService = inject(UploadService);
  private message = inject(NzMessageService);
  // Hoặc dùng constructor injection nếu bạn thích
  // constructor(
  //   private uploadService: UploadService,
  //   private message: NzMessageService
  // ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeQuill();
    }, 0);
  }

  private async initializeQuill() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    try {
      this.isLoading = true;
      const module = await import('quill');
      this.quillModule = module.default;

      const toolbarOptions = [
        ['bold', 'italic', 'underline'],
        ['blockquote', 'code-block'], // Thêm code-block
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': ['', 'center', 'right', 'justify'] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': ['Georgia, serif', 'Arial, sans-serif', 'Courier New, monospace'] }], // Mặc định
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['link', 'image', 'video'], // Thêm video
        ['clean']
      ];

      this.setupCustomFormats();

      this.editor = new this.quillModule(this.editorElement.nativeElement, {
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: () => this.imageHandler() // GỌI ĐÚNG imageHandler
            }
          },
          // Bạn có thể thêm các module khác như image-resize, video-resize,...
          // import ImageResize from 'quill-image-resize-module';
          // Quill.register('modules/imageResize', ImageResize);
          // imageResize: {}
        },
        placeholder: this.placeholder,
        readOnly: this.readOnly,
        theme: 'snow',
        // formats được Quill tự động quản lý dựa trên toolbar và module
        scrollingContainer: 'html'
      });

      if (this.content) { // Nếu có HTML content ban đầu
        this.editor.clipboard.dangerouslyPasteHTML(this.content);
        this.previewContent = this.content;
        this.deltaContent = this.editor.getContents(); // Cập nhật delta
      } else if (this.deltaContent) { // Hoặc nếu có Delta content ban đầu
        this.editor.setContents(this.deltaContent);
        this.content = this.editor.root.innerHTML;
        this.previewContent = this.content;
      }


      const editorDomElement = this.editorElement.nativeElement.querySelector('.ql-editor');
      if (editorDomElement) {
        editorDomElement.style.minHeight = this.minHeight;
        editorDomElement.style.fontFamily = "'Georgia', serif";
        editorDomElement.style.fontSize = '18px';
        editorDomElement.style.lineHeight = '1.8';
      }

      this.editor.on('text-change', (delta: any, oldDelta: any, source: string) => {
        if (source === 'user') { // Chỉ trigger khi người dùng thay đổi
          const html = this.editor.root.innerHTML;
          const currentDelta = this.editor.getContents();

          this.content = html;
          this.deltaContent = currentDelta;
          this.previewContent = html;

          // Gửi cả HTML và Delta. Ưu tiên gửi Delta lên form.
          this.onChange(currentDelta); // <-- TRUYỀN DELTA CHO FORM CONTROL
          this.contentChanged.emit({ html: html, delta: currentDelta });
        }
      });

      this.editor.on('selection-change', (range: any, oldRange: any, source: string) => {
        if (source === 'user') {
          this.onTouched();
        }
      });

      this.editorCreated.emit(this.editor);
      this.isLoading = false;
    } catch (error) {
      console.error('Lỗi khi khởi tạo Quill Editor:', error);
      this.isLoading = false;
    }
  }

  private setupCustomFormats() {
    // ... (Giữ nguyên phần setupCustomFormats của bạn)
    if (!this.quillModule) return;
    try {
      const fontStyleAttributor = this.quillModule.import('attributors/style/font');
      fontStyleAttributor.whitelist = ['Georgia, serif', 'Arial, sans-serif', 'Courier New, monospace'];
      this.quillModule.register(fontStyleAttributor, true);

      const Block = this.quillModule.import('blots/block');
      class ArticleBlock extends Block {}
      ArticleBlock['tagName'] = 'DIV';
      ArticleBlock['className'] = 'article-text';
      this.quillModule.register(ArticleBlock);

      class CaptionBlock extends Block {}
      CaptionBlock['tagName'] = 'DIV';
      CaptionBlock['className'] = 'image-caption';
      this.quillModule.register(CaptionBlock);
    } catch (error) {
      console.error('Lỗi khi setup custom formats:', error);
    }
  }

  imageHandler() {
    if (typeof document === 'undefined') return;

    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        this.uploadImageToServer(file); // <-- GỌI HÀM UPLOAD LÊN SERVER
      }
    };
  }

  private uploadImageToServer(file: File) {
    if (!this.editor) return;
  
    // Hiển thị loading hoặc placeholder cho ảnh đang tải
    const range = this.editor.getSelection(true); // Lấy vị trí con trỏ hiện tại
  
    this.uploadService.uploadEditorImage(file, 'post-content-image')
      .subscribe({
        next: (response: QuillUploadResponse) => {
          if ('success' in response && response.success === 1) {
            // TypeScript now knows response is QuillUploadSuccessResponse
            this.editor.deleteText(range.index, 1); // Xóa placeholder nếu có
            this.editor.insertEmbed(range.index, 'image', response.file.url);
            this.editor.setSelection(range.index + 1, this.quillModule.sources.SILENT);
            this.message.success('Tải ảnh lên thành công!');
          } else {
            // TypeScript now knows response is an error response
            console.error('Lỗi upload từ server:', (response as QuillUploadResponse).error);
            this.message.error(`Lỗi tải ảnh: ${(response as QuillUploadResponse).error || 'Không rõ nguyên nhân'}`);
          }
        },
        error: (err) => {
          console.error('Lỗi HTTP khi upload ảnh:', err);
          this.message.error(`Lỗi kết nối khi tải ảnh: ${err.message || 'Không thể kết nối tới server'}`);
        }
      });
  }

  // ControlValueAccessor methods
  writeValue(value: any): void { // <-- Sửa kiểu thành any để nhận Delta hoặc HTML
    if (typeof window === 'undefined') {
      if (typeof value === 'string') this.content = value || '';
      else this.deltaContent = value;
      return;
    }

    if (this.editor) {
      if (value && typeof value === 'object' && value.ops) { // Nếu là Delta
        this.deltaContent = value;
        this.editor.setContents(value);
        this.content = this.editor.root.innerHTML;
      } else if (typeof value === 'string') { // Nếu là HTML
        this.content = value || '';
        this.editor.clipboard.dangerouslyPasteHTML(value || '');
        this.deltaContent = this.editor.getContents();
      } else { // Nếu rỗng hoặc không xác định
        this.content = '';
        this.deltaContent = null; // Hoặc một Delta rỗng { ops: [{ insert: '\n' }] }
        this.editor.setContents([{ insert: '\n' }]); // Xóa nội dung
      }
      this.previewContent = this.content;
    } else {
      // Nếu editor chưa khởi tạo, lưu giá trị để dùng sau
      if (typeof value === 'string') this.content = value || '';
      else this.deltaContent = value;
    }
  }


  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (typeof window !== 'undefined' && this.editor) {
      this.editor.enable(!isDisabled);
    }
  }

  // Public methods for interacting with the editor
  getContent(): { html: string, delta: any } {
    if (typeof window !== 'undefined' && this.editor) {
      return {
        html: this.editor.root.innerHTML,
        delta: this.editor.getContents()
      };
    }
    return { html: this.content, delta: this.deltaContent };
  }

  clear() {
    this.writeValue(null); // Hoặc truyền Delta rỗng
  }

  focus() {
    if (typeof window !== 'undefined' && this.editor) {
      this.editor.focus();
    }
  }

  // Chuyển đổi tab
  changeTab(index: number) {
    this.activeTab = index;
  }
}