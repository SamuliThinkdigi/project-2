// Maventa API specific types based on the official documentation
export interface MaventaCompany {
  uuid: string;
  name: string;
  bid: string; // Business ID
  country: string;
  address?: {
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
  email?: string;
  phone?: string;
  vat_liable?: boolean;
  vat_number?: string;
  created_at: string;
  updated_at: string;
}

export interface MaventaInvoice {
  uuid: string;
  number: string;
  status: 'DRAFT' | 'SENT' | 'RECEIVED' | 'DELIVERED' | 'PAID' | 'REJECTED' | 'CANCELLED';
  direction: 'SENT' | 'RECEIVED';
  sender: MaventaCompany;
  recipient: MaventaCompany;
  date_created: string;
  date_due: string;
  date_sent?: string;
  date_delivered?: string;
  date_paid?: string;
  sum: number;
  sum_tax: number;
  sum_gross: number;
  currency: string;
  reference?: string;
  comment?: string;
  items: MaventaInvoiceItem[];
  attachments?: MaventaAttachment[];
  routing?: MaventaRouting;
  created_at: string;
  updated_at: string;
}

export interface MaventaInvoiceItem {
  uuid?: string;
  name: string;
  description?: string;
  unit?: string;
  unit_price: number;
  quantity: number;
  discount_percent?: number;
  vat_percent: number;
  sum: number;
  sum_vat: number;
  sum_gross: number;
}

export interface MaventaAttachment {
  uuid: string;
  filename: string;
  content_type: string;
  size: number;
  description?: string;
  created_at: string;
}

export interface MaventaRouting {
  operator?: string;
  identifier?: string;
  identifier_type?: 'BID' | 'VAT' | 'IBAN' | 'EMAIL' | 'EDI';
  routing_id?: string;
}

export interface MaventaWebhook {
  uuid: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaventaApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    per_page?: number;
    total_pages?: number;
  };
}

export interface MaventaAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface MaventaValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface MaventaDeliveryStatus {
  status: 'PENDING' | 'DELIVERED' | 'FAILED' | 'REJECTED';
  timestamp: string;
  details?: string;
  operator?: string;
}

export interface MaventaNotification {
  uuid: string;
  type: 'INVOICE_RECEIVED' | 'INVOICE_DELIVERED' | 'INVOICE_PAID' | 'INVOICE_REJECTED' | 'COMPANY_VERIFIED';
  invoice_uuid?: string;
  company_uuid?: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Additional types for complete integration
export interface MaventaProfile {
  uuid: string;
  name: string;
  email: string;
  company_uuid?: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface MaventaInvoiceFormat {
  format: 'FINVOICE' | 'TEAPPS' | 'PEPPOL_BIS' | 'SVEFAKTURA';
  version?: string;
}

export interface MaventaDeliveryMethod {
  method: 'EDI' | 'EMAIL' | 'PRINT' | 'PEPPOL';
  address?: string;
  verified?: boolean;
}