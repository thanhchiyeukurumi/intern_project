import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload'; // Import NzUploadFile
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzProgressModule } from 'ng-zorro-antd/progress'; // Import Progress Module
import { NzEmptyModule } from 'ng-zorro-antd/empty';      // Import Empty Module
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';  // Import Tooltip Module
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface MediaItem {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
  uploadDate: string;
  thumbnail: string;
  fileObjectUrl?: string; // To store blob URL for cleanup
}

@Component({
  selector: 'app-blogger-media',
  templateUrl: './blogger-media.component.html',
  styleUrls: ['./blogger-media.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzDropDownModule,
    NzPopconfirmModule,
    NzUploadModule,
    NzTypographyModule,
    NzGridModule,
    NzProgressModule, // Add Progress Module
    NzEmptyModule,    // Add Empty Module
    NzToolTipModule   // Add Tooltip Module
  ]
})
export class BloggerMediaComponent implements OnInit, OnDestroy {
  searchText = '';
  viewMode = 'grid'; // 'grid' or 'list'
  isUploading = false;
  uploadProgress = 0;

  // Original list - fetched from API in real app
  private allMediaItems: MediaItem[] = [
     {
      id: '1',
      name: 'hero-image.jpg',
      type: 'image/jpeg',
      size: '1.2 MB',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      uploadDate: 'May 15, 2023',
      thumbnail: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
    },
    {
      id: '2',
      name: 'coding-desktop.png',
      type: 'image/png',
      size: '850 KB',
      url: 'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp',
      uploadDate: 'April 28, 2023',
      thumbnail: 'https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp'
    },
    {
      id: '3',
      name: 'report-q1-2023.pdf',
      type: 'application/pdf',
      size: '2.4 MB',
      url: '#', // Placeholder URL
      uploadDate: 'March 12, 2023',
      // Use a generic icon representation or server-provided thumb for non-images
      thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/1200px-PDF_file_icon.svg.png' // Example PDF icon
    },
    {
      id: '4',
      name: 'presentation.pptx',
      type: 'application/vnd.ms-powerpoint',
      size: '3.1 MB',
      url: '#', // Placeholder URL
      uploadDate: 'February 28, 2023',
      thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Microsoft_PowerPoint_2013-2019_logo.svg/1200px-Microsoft_PowerPoint_2013-2019_logo.svg.png' // Example PPT icon
    }
    // Add more items if needed
  ];

  // List displayed in the template, filtered based on searchText
  mediaItems: MediaItem[] = [];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private message: NzMessageService) {}

  ngOnInit(): void {
    // Initially, display all items
    this.filterMedia();

    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(300), // Wait for 300ms pause in typing
      distinctUntilChanged(), // Only emit if value changed
      takeUntil(this.destroy$) // Unsubscribe on component destroy
    ).subscribe(() => {
      this.filterMedia();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Clean up Blob URLs created by URL.createObjectURL
    this.allMediaItems.forEach(item => {
      if (item.fileObjectUrl) {
        URL.revokeObjectURL(item.fileObjectUrl);
      }
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchText);
  }

  filterMedia(): void {
    const searchTerm = this.searchText.toLowerCase().trim();
    if (!searchTerm) {
      this.mediaItems = [...this.allMediaItems]; // Show all if search is empty
    } else {
      this.mediaItems = this.allMediaItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm)
      );
    }
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  deleteMedia(id: string): void {
    console.log(`TODO: Call API to delete media with id: ${id}`);
    // --- Real implementation would call API first ---
    this.allMediaItems = this.allMediaItems.filter(item => item.id !== id);
    this.filterMedia(); // Update the displayed list
    this.message.success('Media deleted successfully (client-side)');
  }

  copyUrl(url: string): void {
    if (url === '#') {
        this.message.warning('Cannot copy placeholder URL');
        return;
    }
    navigator.clipboard.writeText(url)
      .then(() => {
        this.message.success('URL copied to clipboard');
      })
      .catch(err => {
        this.message.error('Failed to copy URL');
        console.error('Could not copy text: ', err);
      });
  }

  // Use NzUploadFile type for better type checking
  beforeUpload = (file: NzUploadFile): boolean => {
    // --- THIS IS A SIMULATION ---
    // In a real app: Use HttpClient to post the 'file' object to your backend.
    // Handle progress events from HttpClient if needed for accurate progress bar.
    // On success, get the real URL, ID, etc., from the server response.

    const isImage = file.type?.startsWith('image/');
    const isLt5M = (file.size ?? 0) / 1024 / 1024 < 5;

    if (!isLt5M) {
      this.message.error('File must be smaller than 5MB!');
      return false; // Prevent upload
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress += 25;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.isUploading = false;

        // --- Create new item based on SIMULATED success ---
        // Replace with data from server response in real app
        let thumbnailUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Generic_file_icon_%28monocolor%29.svg/1200px-Generic_file_icon_%28monocolor%29.svg.png'; // Generic fallback
        let fileObjectUrl: string | undefined = undefined;

        if (isImage && file instanceof File) { // Check if it's a File object for createObjectURL
          fileObjectUrl = URL.createObjectURL(file);
          thumbnailUrl = fileObjectUrl; // Use blob URL for preview
        } else if (file.type?.startsWith('application/pdf')) {
            thumbnailUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/1200px-PDF_file_icon.svg.png';
        } // Add more specific icons if needed

        const newItem: MediaItem = {
          // Generate a temporary ID or get from server
          id: `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: file.name,
          type: file.type || 'unknown',
          size: file.size ? (file.size / 1024).toFixed(0) + ' KB' : 'N/A',
          // Replace with ACTUAL URL from server
          url: `https://example.com/uploads/${file.name}`,
          uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          thumbnail: thumbnailUrl,
          fileObjectUrl: fileObjectUrl // Store blob URL for cleanup
        };

        // Add to the main list and refresh filtered view
        this.allMediaItems = [newItem, ...this.allMediaItems];
        this.filterMedia();

        this.message.success(`${file.name} uploaded successfully (simulated)`);
      }
    }, 250);

    // Return false to prevent default nz-upload behavior,
    // as we are handling (simulating) the upload manually.
    return false;
  };

  // TrackBy function for *ngFor performance
  trackById(index: number, item: MediaItem): string {
    return item.id;
  }
}