import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-blogger-profile',
  templateUrl: './blogger-profile.component.html',
  styleUrls: ['./blogger-profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAvatarModule,
    NzUploadModule,
    NzTypographyModule
  ]
})
export class BloggerProfileComponent implements OnInit {
  profileForm!: FormGroup;
  avatarUrl = 'https://gravatar.com/userimage/226055550/371783b5621ab23c89278350e3e85e27.jpeg?size=256';
  isLoading = false;
  
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService
  ) {}
  
  ngOnInit(): void {
    this.createForm();
    this.loadUserProfile();
  }
  
  createForm(): void {
    this.profileForm = this.fb.group({
      username: [{ value: 'thanhthikalyce', disabled: true }],
      name: ['Hoang Thanh', Validators.required],
      aboutMe: ['Front-end developer and technical writer', Validators.required]
    });
  }
  
  loadUserProfile(): void {
    // In a real app, this would load user data from an API
    console.log('Loading user profile...');
  }
  
  onSubmit(): void {
    if (this.profileForm.invalid) {
      Object.values(this.profileForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      });
      return;
    }
    
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.message.success('Profile updated successfully');
    }, 1000);
  }
  
  fileList: NzUploadFile[] = [];

  beforeUpload = (file: NzUploadFile): boolean => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      this.message.error('You can only upload JPG or PNG files!');
      return false;
    }
    
    const isLt2M = file.size !== undefined && file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.message.error('Image must be smaller than 2MB!');
      return false;
    }
    
    // Handle file upload here (would typically upload to server)
    // For demo, just update the avatar URL with a mock URL
    this.handleImagePreview(file);
    return false; // Prevent actual upload
  };
  
  private handleImagePreview(file: NzUploadFile): void {
    const reader = new FileReader();
    reader.readAsDataURL(file as any);
    reader.onload = () => {
      this.avatarUrl = reader.result as string;
      this.message.success('Avatar updated successfully');
    };
  }
}