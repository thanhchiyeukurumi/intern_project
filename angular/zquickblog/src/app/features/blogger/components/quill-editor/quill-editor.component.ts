import { Component, forwardRef, ElementRef, ViewChild, AfterViewInit, Input, Output, EventEmitter, inject } from '@angular/core';
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
import { UploadService, QuillUploadResponse } from '../../../../core/services/upload.service';
import { NzMessageService } from 'ng-zorro-antd/message';

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
    SafeHtmlPipe
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
  @Input() minHeight = '200px';
  @Output() editorCreated = new EventEmitter<any>();
  @Output() contentChanged = new EventEmitter<{ html: string, delta: any }>();

  editor: any;
  quillModule: any;
  content: string = '';
  deltaContent: any = null;
  disabled: boolean = false;
  onChange: any = () => {};
  onTouched: any = () => {};
  activeTab = 0;
  previewContent: string = '';
  isLoading = false;

  private uploadService = inject(UploadService);
  private message = inject(NzMessageService);

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
        [{ 'header': [1, 2, 3, false] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ];

      this.setupCustomFormats();

      this.editor = new this.quillModule(this.editorElement.nativeElement, {
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: () => this.imageHandler()
            }
          }
        },
        placeholder: this.placeholder,
        readOnly: this.readOnly,
        theme: 'snow'
      });

      if (this.content) {
        this.editor.clipboard.dangerouslyPasteHTML(this.content);
        this.previewContent = this.content;
        this.deltaContent = this.editor.getContents();
      } else if (this.deltaContent) {
        this.editor.setContents(this.deltaContent);
        this.content = this.editor.root.innerHTML;
        this.previewContent = this.content;
      }

      const editorDomElement = this.editorElement.nativeElement.querySelector('.ql-editor');
      if (editorDomElement) {
        editorDomElement.style.minHeight = this.minHeight;
        editorDomElement.style.fontFamily = "'Roboto', 'Noto Sans', sans-serif";
        editorDomElement.style.fontSize = '16px'; // Giảm từ 22px xuống 16px
        editorDomElement.style.lineHeight = '1.6';
        editorDomElement.style.textAlign = 'left';
      }

      this.editor.on('text-change', (delta: any, oldDelta: any, source: string) => {
        if (source === 'user') {
          const html = this.editor.root.innerHTML;
          const currentDelta = this.editor.getContents();

          this.content = html;
          this.deltaContent = currentDelta;
          this.previewContent = html;

          this.onChange(html); // Gửi HTML thay vì Delta
          this.contentChanged.emit({ html: html, delta: currentDelta });
        }
      });

      this.editor.on('selection-change', (range: any, oldRange: any, source: string) => {
        if (source === 'user') {
          this.onTouched();
        }
      });

      // Xử lý dán hình ảnh
      this.editor.clipboard.addMatcher(Node.ELEMENT_NODE, (node: Node, delta: any) => {
        if ((node as HTMLElement).tagName === 'IMG' && (node as HTMLImageElement).src.startsWith('data:image/')) {
          const file = this.dataUrlToFile((node as HTMLImageElement).src);
          if (file) {
            this.uploadImageToServer(file);
          }
          return { ops: [] }; // Ngăn chèn base64
        }
        return delta;
      });

      this.editorCreated.emit(this.editor);
      this.isLoading = false;
    } catch (error) {
      console.error('Lỗi khi khởi tạo Quill Editor:', error);
      this.isLoading = false;
    }
  }

  private dataUrlToFile(dataUrl: string): File | null {
    if (!dataUrl.startsWith('data:image/')) return null;

    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const filename = `pasted-image-${Date.now()}.png`;
    return new File([u8arr], filename, { type: mime });
  }

  private setupCustomFormats() {
    if (!this.quillModule) return;
    try {
      const fontStyleAttributor = this.quillModule.import('attributors/style/font');
      fontStyleAttributor.whitelist = ['Roboto', 'Noto Sans', 'sans-serif'];
      this.quillModule.register(fontStyleAttributor, true);

      const Block = this.quillModule.import('blots/block');
      class ArticleBlock extends Block {}
      ArticleBlock['tagName'] = 'DIV';
      ArticleBlock['className'] = 'article-text';
      this.quillModule.register(ArticleBlock);
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
        this.uploadImageToServer(file);
      }
    };
  }

  private uploadImageToServer(file: File) {
    if (!this.editor) return;

    const range = this.editor.getSelection(true);

    this.uploadService.uploadEditorImage(file, 'post-content-image')
      .subscribe({
        next: (response: QuillUploadResponse) => {
          if ('success' in response && response.success === 1) {
            this.editor.deleteText(range.index, 1);
            this.editor.insertEmbed(range.index, 'image', response.file.url);
            this.editor.setSelection(range.index + 1, this.quillModule.sources.SILENT);
            this.message.success('Tải ảnh lên thành công!');
          } else {
            console.error('Lỗi upload từ server:', (response as any).error);
            this.message.error(`Lỗi tải ảnh: ${(response as any).error || 'Không rõ nguyên nhân'}`);
          }
        },
        error: (err) => {
          console.error('Lỗi HTTP khi upload ảnh:', err);
          this.message.error(`Lỗi kết nối khi tải ảnh: ${err.message || 'Không thể kết nối tới server'}`);
        }
      });
  }

  writeValue(value: any): void {
    if (typeof window === 'undefined') {
      if (typeof value === 'string') this.content = value || '';
      else this.deltaContent = value;
      return;
    }

    if (this.editor) {
      if (value && typeof value === 'object' && value.ops) {
        this.deltaContent = value;
        this.editor.setContents(value);
        this.content = this.editor.root.innerHTML;
      } else if (typeof value === 'string') {
        this.content = value || '';
        this.editor.clipboard.dangerouslyPasteHTML(value || '');
        this.deltaContent = this.editor.getContents();
      } else {
        this.content = '';
        this.deltaContent = null;
        this.editor.setContents([{ insert: '\n' }]);
      }
      this.previewContent = this.content;
      this.onChange(this.content); // Gửi HTML
    } else {
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
    this.writeValue(null);
  }

  focus() {
    if (typeof window !== 'undefined' && this.editor) {
      this.editor.focus();
    }
  }

  changeTab(index: number) {
    this.activeTab = index;
  }
}