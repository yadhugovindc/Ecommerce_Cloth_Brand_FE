export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: Category | string;
  subCategory: string;
  price: number;
  discountPrice?: number;
  images: string[];
  colors: string[];
  sizes: string[];
  material: string;
  gender: "women" | "men" | "unisex";
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isSale: boolean;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number; // effective price (discounted if on sale)
  originalPrice?: number;
  size: string;
  color: string;
  quantity: number;
  stock: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  itemsTotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

export function effectivePrice(p: { price: number; discountPrice?: number }): number {
  return p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
}