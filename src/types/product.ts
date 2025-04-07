
export interface Product {
  id: string;
  farmerId: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: ProductCategory;
  subCategory?: string;
  quantity: number;
  unit: 'kg' | 'g' | 'pieces' | 'bundle' | 'liter' | 'ml';
  availabilityDate?: Date;
  isFeatured?: boolean;
  tags: string[];
  nutritionalInfo?: NutritionalInfo;
  farmingMethod?: 'organic' | 'conventional' | 'hydroponic' | 'other';
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = 
  | 'vegetables' 
  | 'fruits' 
  | 'dairy' 
  | 'grains' 
  | 'nuts' 
  | 'spices' 
  | 'herbs' 
  | 'honey' 
  | 'other';

export interface NutritionalInfo {
  calories?: number;
  proteins?: number;
  carbohydrates?: number;
  fats?: number;
  fiber?: number;
  vitamins?: { [key: string]: number };
  minerals?: { [key: string]: number };
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}
