import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-blogger-settings',
  templateUrl: './blogger-settings.component.html',
  styleUrls: ['./blogger-settings.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzSwitchModule,
    NzTabsModule,
    NzTypographyModule,
    NzDividerModule,
    NzIconModule
  ]
})
export class BloggerSettingsComponent implements OnInit {
  generalForm!: FormGroup;
  privacyForm!: FormGroup;
  integrationForm!: FormGroup;
  isLoading = false;
  
  languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Vietnamese', value: 'vi' },
    { label: 'French', value: 'fr' },
    { label: 'Spanish', value: 'es' }
  ];
  
  defaultLanguageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Vietnamese', value: 'vi' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService
  ) {}
  
  ngOnInit(): void {
    this.createForms();
    this.loadSettings();
  }
  
  createForms(): void {
    this.generalForm = this.fb.group({
      blogName: ['Hoang Thanh\'s Blog'],
      blogDescription: ['Thoughts on programming, design, and tech'],
      defaultLanguage: ['en'],
      postsPerPage: [10],
      enableComments: [true]
    });
    
    this.privacyForm = this.fb.group({
      makeProfilePublic: [true],
      showEmail: [false],
      allowSearchEngines: [true],
      cookieConsent: [true],
      dataCollection: [true]
    });
    
    this.integrationForm = this.fb.group({
      googleAnalyticsId: [''],
      facebookPixelId: [''],
      disqusShortname: ['']
    });
  }
  
  loadSettings(): void {
    // In a real app, this would fetch settings from an API
    console.log('Loading user settings...');
  }
  
  saveGeneralSettings(): void {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.message.success('General settings saved successfully');
    }, 800);
  }
  
  savePrivacySettings(): void {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.message.success('Privacy settings saved successfully');
    }, 800);
  }
  
  saveIntegrationSettings(): void {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.message.success('Integration settings saved successfully');
    }, 800);
  }
  
  exportData(): void {
    this.message.info('Exporting your data, this may take a moment...');
    
    // Simulate export
    setTimeout(() => {
      this.message.success('Data exported successfully. Check your email for the download link.');
    }, 1500);
  }
  
  deleteAccount(): void {
    this.message.warning('Account deletion request submitted. You will receive confirmation by email.');
  }
}