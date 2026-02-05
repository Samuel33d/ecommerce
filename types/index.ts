export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  _count?: { products: number };
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  user?: { id: string; email: string; firstName: string; lastName: string };
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  stripeSessionId?: string;
  stripePaymentId?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingZip: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: (Order & {
    user: { firstName: string; lastName: string; email: string };
  })[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ReportSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  startDate: string;
  endDate: string;
}

export interface StatusBreakdown {
  status: OrderStatus;
  count: number;
  revenue: number;
}

export interface TopProduct {
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface ReportData {
  summary: ReportSummary;
  ordersByStatus: StatusBreakdown[];
  topSellingProducts: TopProduct[];
  orders: Order[];
}
