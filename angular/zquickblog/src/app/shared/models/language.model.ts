export interface LanguageDto {
  name: string;
  locale: string;
  is_active?: boolean;
}

export interface Language {
  id: number;
  name: string;
  locale: string;
  is_active: boolean;
}
