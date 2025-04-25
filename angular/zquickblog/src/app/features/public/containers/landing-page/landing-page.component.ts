import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// NG-ZORRO
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzButtonModule,
    NzGridModule,
    NzLayoutModule
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  heroContent = {
    title: 'Human stories & ideas',
    description: 'A place to read, write, and deepen your understanding',
    buttonText: 'Start reading',
    buttonLink: '/home',
    heroImage: 'https://miro.medium.com/v2/format:webp/4*SdjkdS98aKH76I8eD0_qjw.png'
  };

  constructor() { }

  ngOnInit(): void {
  }
} 