export interface Company {
  id: string;
  name: string;
  businessId: string;
  vatId?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  email: string;
  phone?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'delivered' | 'paid' | 'overdue' | 'cancelled';
  type: 'outgoing' | 'incoming';
  sender: Company;
  recipient: Company;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  currency: string;
  notes?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}