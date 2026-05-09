// Shape of data returned by the API — mirrors the server's SQL SELECT columns.
// pg always returns NUMERIC as string, so price fields are typed as string.

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  gender: 'men' | 'women' | 'unisex' | null;
  shoe_type: 'road' | 'trail' | 'track' | null;
  weight_grams: number | null;
  drop_mm: number | null;
  created_at: string;
  category_slug: string;
  category_name: string;
  brand_slug: string | null;
  brand_name: string | null;
  total_stock: string;
}

export interface ProductVariant {
  id: number;
  size: string;
  sku: string;
  stock: number;
  price_override: string | null;
  effective_price: string;
}

export interface ProductDetail extends Product {
  updated_at: string;
  variants: ProductVariant[];
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  size: string;
  sku: string;
  product_name: string;
  image_url: string | null;
}

export interface Order {
  id: number;
  user_id: number;
  total: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}
