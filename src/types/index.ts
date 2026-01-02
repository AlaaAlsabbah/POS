// === Core Domain Types ===

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  barcode?: string;
  stock: number;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number; // percentage discount for this item
}

// Sale lifecycle: draft → completed | voided
// Completed sales can be: refunded
export type SaleStatus = 'draft' | 'parked' | 'completed' | 'voided' | 'refunded';

export type PaymentMethod = 'cash' | 'card' | 'split';

export interface PaymentDetail {
  method: 'cash' | 'card';
  amount: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number; // total discount amount
  tax: number;
  total: number;
  status: SaleStatus;
  payments: PaymentDetail[];
  cashierId: string;
  customerId?: string;
  customerName?: string;
  note?: string;
  createdAt: string;
  completedAt?: string;
  refundedAt?: string;
  refundReason?: string;
  receiptNumber?: string;
}

export interface Cashier {
  id: string;
  name: string;
  pin: string;
  avatar?: string;
}

export interface Session {
  id: string;
  cashierId: string;
  startedAt: string;
  endedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  salesCount: number;
  totalSales: number;
}

// === UI State Types ===

export type ViewMode = 'grid' | 'list';

export interface SaleFilters {
  status?: SaleStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// === Constants ===

export const TAX_RATE = 0.16; // 16% tax

export const CATEGORIES = [
  'All',
  'Beverages',
  'Snacks',
  'Dairy',
  'Bakery',
  'Produce',
  'Meat',
  'Household',
  'Personal Care',
] as const;

export type Category = typeof CATEGORIES[number];

