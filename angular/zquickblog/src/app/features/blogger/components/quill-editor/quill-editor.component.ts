import { Component, forwardRef, ElementRef, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
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
import { QuillModule } from 'ngx-quill';

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
    QuillModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuillEditorComponent),
      multi: true
    }
  ]
})
export class QuillEditorComponent implements ControlValueAccessor, AfterViewInit {
  @ViewChild('editor') editorElement!: ElementRef;
  @Input() placeholder = 'Bắt đầu viết bài của bạn tại đây...';
  @Input() readOnly = false;
  @Input() minHeight = '300px';
  @Output() editorCreated = new EventEmitter<any>();
  @Output() contentChanged = new EventEmitter<string>();

  editor: any;
  quillModule: any;
  content: string = '';
  disabled: boolean = false;
  onChange: any = () => {};
  onTouched: any = () => {};
  activeTab = 0;
  previewContent: string = '';
  isLoading = false;

  ngAfterViewInit() {
    // Sử dụng setTimeout để đảm bảo DOM đã sẵn sàng
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
      // Dynamic import của Quill
      const module = await import('quill');
      this.quillModule = module.default;

      // Define toolbar options
      const toolbarOptions = [
        ['bold', 'italic', 'underline'],
        ['blockquote'],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': ['', 'center', 'right', 'justify'] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': ['Georgia, serif', 'Arial, sans-serif', 'Courier New, monospace'] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['link', 'image'],
        ['clean']
      ];
      
      // Tạo định dạng và đăng ký custom formats
      this.setupCustomFormats();

      // Initialize Quill
      this.editor = new this.quillModule(this.editorElement.nativeElement, {
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: this.imageHandler.bind(this)
            }
          }
        },
        placeholder: this.placeholder,
        readOnly: this.readOnly,
        theme: 'snow',
        formats: ['bold', 'italic', 'underline', 'blockquote', 'header', 
                  'list', 'bullet', 'indent', 'align', 'color', 'background', 
                  'font', 'size', 'link', 'image'],
        scrollingContainer: 'html'
      });

      // Set content if available
      if (this.content) {
        this.editor.clipboard.dangerouslyPasteHTML(this.content);
        this.previewContent = this.content;
      }

      // Thiết lập CSS mặc định cho editor
      const editorElement = this.editorElement.nativeElement.querySelector('.ql-editor');
      if (editorElement) {
        editorElement.style.minHeight = this.minHeight;
        editorElement.style.fontFamily = "'Georgia', serif";
        editorElement.style.fontSize = '18px';
        editorElement.style.lineHeight = '1.8';
      }
      
      // Listen to changes in editor
      this.editor.on('text-change', () => {
        if (this.editorElement?.nativeElement) {
          const html = this.editorElement.nativeElement.querySelector('.ql-editor').innerHTML;
          this.onChange(html);
          this.contentChanged.emit(html);
          this.previewContent = html;
        }
      });

      this.editor.on('selection-change', () => {
        this.onTouched();
      });

      // Emit the created editor
      this.editorCreated.emit(this.editor);
      this.isLoading = false;
    } catch (error) {
      console.error('Lỗi khi khởi tạo Quill Editor:', error);
      this.isLoading = false;
    }
  }

  private setupCustomFormats() {
    if (!this.quillModule) return;
    
    try {
      // Tạo Font Style
      const fontStyleAttributor = this.quillModule.import('attributors/style/font');
      fontStyleAttributor.whitelist = ['Georgia, serif', 'Arial, sans-serif', 'Courier New, monospace'];
      this.quillModule.register(fontStyleAttributor, true);

      // Tạo class mới cho Quill
      const Block = this.quillModule.import('blots/block');
      class ArticleBlock extends Block {}
      ArticleBlock['tagName'] = 'DIV';
      ArticleBlock['className'] = 'article-text';
      this.quillModule.register(ArticleBlock);

      // Class cho caption
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
        // Đây là nơi bạn sẽ tải lên hình ảnh và nhận URL
        this.uploadImage(file);
      }
    };
  }

  uploadImage(file: File) {
    if (typeof window === 'undefined' || !this.editor) return;
    
    // Giả lập quá trình tải lên - trong ứng dụng thực tế, bạn sẽ gửi file đến server
    const reader = new FileReader();
    reader.onload = (e) => {
      const range = this.editor.getSelection(true);
      this.editor.insertEmbed(range.index, 'image', reader.result);
      this.editor.setSelection(range.index + 1);
    };
    reader.readAsDataURL(file);
  }

  // Chuyển đổi tab
  changeTab(index: number) {
    this.activeTab = index;
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.content = value || '';
    this.previewContent = value || '';
    
    if (typeof window !== 'undefined' && this.editor) {
      if (value) {
        this.editor.clipboard.dangerouslyPasteHTML(value);
      } else {
        this.editor.setText('');
      }
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
  setContent(content: string) {
    this.writeValue(content);
  }

  getContent(): string {
    return typeof window !== 'undefined' && this.editor ? this.editor.root.innerHTML : '';
  }

  clear() {
    if (typeof window !== 'undefined' && this.editor) {
      this.editor.setText('');
      this.previewContent = '';
    }
  }

  focus() {
    if (typeof window !== 'undefined' && this.editor) {
      this.editor.focus();
    }
  }
} 