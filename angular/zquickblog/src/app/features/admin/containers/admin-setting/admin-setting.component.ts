import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';

interface Language {
  id: number;
  name: string;
  code: string;
}

@Component({
  selector: 'app-admin-setting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTabsModule,
    NzSwitchModule,
    NzSelectModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule
  ],
  templateUrl: './admin-setting.component.html',
  styleUrl: './admin-setting.component.css'
})
export class AdminSettingComponent implements OnInit {
  darkModeEnabled = false;
  emailNotifications = true;
  backupFrequency = 'weekly';
  newLanguage = '';
  newLanguageCode = '';
  languages: Language[] = [];
  
  ngOnInit(): void {
    this.languages = [
      { id: 1, name: 'English', code: 'en' },
      { id: 2, name: 'Spanish', code: 'es' },
      { id: 3, name: 'French', code: 'fr' }
    ];
  }
  
  addLanguage(): void {
    if (this.newLanguage && this.newLanguageCode) {
      const newId = Math.max(0, ...this.languages.map(l => l.id)) + 1;
      this.languages.push({
        id: newId,
        name: this.newLanguage,
        code: this.newLanguageCode
      });
      this.newLanguage = '';
      this.newLanguageCode = '';
    }
  }
  
  removeLanguage(id: number): void {
    this.languages = this.languages.filter(lang => lang.id !== id);
  }
}
