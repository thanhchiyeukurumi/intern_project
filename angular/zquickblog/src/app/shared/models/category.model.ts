export interface CategoryDto {
    name: string;
    description?: string;
    slug?: string;
    parent_id: number | null | undefined;
  }

export interface Category {
  id: number,
  name: string;
  description?: string;
  slug?: string;
  parent_id?: number | null | undefined;
  data: any;
}