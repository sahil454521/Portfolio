// This file exports TypeScript types and interfaces used throughout the application for type safety.

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Recommendation {
  productId: string;
  reason: string;
}