export interface Photo {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  filename: string;
  extra_images: string[];
  formats: { label: string; price: number }[];
  featured: boolean;
  position: number;
  created_at: any;
  category_name?: string;
  category_slug?: string;
  min_price?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  cover_image: string | null;
  position: number;
  created_at: any;
  photo_count?: number;
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  subject: string;
  photo_title: string | null;
  format_selected: string | null;
  message: string;
  read: boolean;
  created_at: any;
}

export interface AdminUser {
  username: string;
  password_hash: string;
}

export interface Settings {
  [key: string]: string;
}
