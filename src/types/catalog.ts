export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  stock: number;
  priceRetail: number;
  priceWholesale: number;
  priceVip: number;
}

export interface ProductItem {
  id: string;
  title: string;
  sku: string;
  category: string;
  description: string;
  imageUrl: string;
  stockTotal: number;
  unit: string;
  priceRetail: number;
  priceWholesale: number;
  priceVip: number;
  variants?: ProductVariant[];
}

export interface OrderCartItem {
  product: ProductItem;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface QuotationDraft {
  quoteId: string;
  customerPhone: string;
  items: OrderCartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentLink: string;
  expiresInHours: number;
  notes: string;
}
