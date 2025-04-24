import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private darkModeSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public darkMode$: Observable<boolean> = this.darkModeSubject.asObservable();
  
  private readonly STORAGE_KEY = 'admin-dark-theme';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Check saved theme preference or use system preference as default
    const isDarkMode = this.getCurrentThemeState();
    this.setDarkMode(isDarkMode);
  }

  private getCurrentThemeState(): boolean {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    if (savedTheme) {
      return savedTheme === 'enabled';
    }
    // Check system preference if no saved preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  public toggleDarkMode(): void {
    const currentValue = this.darkModeSubject.getValue();
    this.setDarkMode(!currentValue);
  }

  public setDarkMode(isDarkMode: boolean): void {
    // Update theme in DOM
    if (isDarkMode) {
      this.renderer.setAttribute(document.documentElement, 'data-theme', 'dark');
    } else {
      this.renderer.removeAttribute(document.documentElement, 'data-theme');
    }
    
    // Save preference to localStorage
    localStorage.setItem(this.STORAGE_KEY, isDarkMode ? 'enabled' : 'disabled');
    
    // Update subject value
    this.darkModeSubject.next(isDarkMode);
  }

  public isDarkMode(): boolean {
    return this.darkModeSubject.getValue();
  }
}