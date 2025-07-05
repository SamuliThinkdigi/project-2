import { 
  MaventaCompany, 
  MaventaInvoice, 
  MaventaApiResponse, 
  MaventaAuthResponse,
  MaventaValidationResult,
  MaventaDeliveryStatus,
  MaventaNotification,
  MaventaWebhook,
  MaventaProfile
} from '../types/maventa';
import { Company, Invoice } from '../types/invoice';

class MaventaService {
  private baseUrl = 'https://api.maventa.com/v1';
  private testUrl = 'https://api-test.maventa.com/v1';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isTestMode = true;

  constructor() {
    this.loadTokensFromStorage();
  }

  private get apiUrl() {
    return this.isTestMode ? this.testUrl : this.baseUrl;
  }

  private loadTokensFromStorage() {
    const tokens = localStorage.getItem('maventa_tokens');
    if (tokens) {
      const parsed = JSON.parse(tokens);
      this.accessToken = parsed.accessToken;
      this.refreshToken = parsed.refreshToken;
      this.isTestMode = parsed.isTestMode ?? true;
    }
  }

  private saveTokensToStorage(tokens: { accessToken: string; refreshToken?: string; isTestMode: boolean }) {
    localStorage.setItem('maventa_tokens', JSON.stringify(tokens));
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken || null;
    this.isTestMode = tokens.isTestMode;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<MaventaApiResponse<T>> {
    try {
      const url = `${this.apiUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Thinkdigi-Invoice-Hub/1.0',
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || `HTTP_${response.status}`,
            message: data.error?.message || data.message || `HTTP ${response.status}`,
            details: data.error?.details || data.details
          }
        };
      }

      return {
        success: true,
        data: data.data || data,
        meta: data.meta
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred'
        }
      };
    }
  }

  // Authentication
  async authenticate(clientId: string, clientSecret: string, testMode = true): Promise<MaventaApiResponse<MaventaAuthResponse>> {
    this.isTestMode = testMode;
    
    const response = await this.makeRequest<MaventaAuthResponse>('/oauth/token', {
      method: 'POST',
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'eui'
      })
    });

    if (response.success && response.data) {
      this.saveTokensToStorage({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        isTestMode: testMode
      });
    }

    return response;
  }

  async refreshAccessToken(): Promise<MaventaApiResponse<MaventaAuthResponse>> {
    if (!this.refreshToken) {
      return { 
        success: false, 
        error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token available' }
      };
    }

    const response = await this.makeRequest<MaventaAuthResponse>('/oauth/token', {
      method: 'POST',
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken
      })
    });

    if (response.success && response.data) {
      this.saveTokensToStorage({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || this.refreshToken,
        isTestMode: this.isTestMode
      });
    }

    return response;
  }

  // Profile Management
  async getProfile(): Promise<MaventaApiResponse<MaventaProfile>> {
    return this.makeRequest<MaventaProfile>('/profile');
  }

  // Company Management
  async getCompanies(page = 1, perPage = 50): Promise<MaventaApiResponse<MaventaCompany[]>> {
    return this.makeRequest<MaventaCompany[]>(`/companies?page=${page}&per_page=${perPage}`);
  }

  async getCompanyById(uuid: string): Promise<MaventaApiResponse<MaventaCompany>> {
    return this.makeRequest<MaventaCompany>(`/companies/${uuid}`);
  }

  async createCompany(company: Partial<MaventaCompany>): Promise<MaventaApiResponse<MaventaCompany>> {
    return this.makeRequest<MaventaCompany>('/companies', {
      method: 'POST',
      body: JSON.stringify(company)
    });
  }

  async verifyCompany(bid: string, country = 'FI'): Promise<MaventaApiResponse<{ verified: boolean; company?: MaventaCompany }>> {
    return this.makeRequest<{ verified: boolean; company?: MaventaCompany }>(`/companies/verify?bid=${bid}&country=${country}`);
  }

  // Invoice Management
  async getInvoices(
    direction?: 'SENT' | 'RECEIVED',
    status?: string,
    page = 1,
    perPage = 50
  ): Promise<MaventaApiResponse<MaventaInvoice[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });
    
    if (direction) params.append('direction', direction);
    if (status) params.append('status', status);

    return this.makeRequest<MaventaInvoice[]>(`/invoices?${params}`);
  }

  async getInvoiceById(uuid: string): Promise<MaventaApiResponse<MaventaInvoice>> {
    return this.makeRequest<MaventaInvoice>(`/invoices/${uuid}`);
  }

  async createInvoice(invoice: Partial<MaventaInvoice>): Promise<MaventaApiResponse<MaventaInvoice>> {
    return this.makeRequest<MaventaInvoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice)
    });
  }

  async sendInvoice(uuid: string): Promise<MaventaApiResponse<MaventaInvoice>> {
    return this.makeRequest<MaventaInvoice>(`/invoices/${uuid}/send`, {
      method: 'POST'
    });
  }

  async validateInvoice(invoice: Partial<MaventaInvoice>): Promise<MaventaApiResponse<MaventaValidationResult>> {
    return this.makeRequest<MaventaValidationResult>('/invoices/validate', {
      method: 'POST',
      body: JSON.stringify(invoice)
    });
  }

  async getInvoiceStatus(uuid: string): Promise<MaventaApiResponse<MaventaDeliveryStatus>> {
    return this.makeRequest<MaventaDeliveryStatus>(`/invoices/${uuid}/status`);
  }

  // Notifications
  async getNotifications(unreadOnly = false, page = 1, perPage = 50): Promise<MaventaApiResponse<MaventaNotification[]>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });
    
    if (unreadOnly) params.append('unread_only', 'true');

    return this.makeRequest<MaventaNotification[]>(`/notifications?${params}`);
  }

  async markNotificationAsRead(uuid: string): Promise<MaventaApiResponse<MaventaNotification>> {
    return this.makeRequest<MaventaNotification>(`/notifications/${uuid}/read`, {
      method: 'POST'
    });
  }

  async markAllNotificationsAsRead(): Promise<MaventaApiResponse<void>> {
    return this.makeRequest<void>('/notifications/read-all', {
      method: 'POST'
    });
  }

  // Webhooks
  async getWebhooks(): Promise<MaventaApiResponse<MaventaWebhook[]>> {
    return this.makeRequest<MaventaWebhook[]>('/webhooks');
  }

  async createWebhook(webhook: Partial<MaventaWebhook>): Promise<MaventaApiResponse<MaventaWebhook>> {
    return this.makeRequest<MaventaWebhook>('/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhook)
    });
  }

  async deleteWebhook(uuid: string): Promise<MaventaApiResponse<void>> {
    return this.makeRequest<void>(`/webhooks/${uuid}`, {
      method: 'DELETE'
    });
  }

  // Utility methods for converting between our internal types and Maventa types
  convertToMaventaCompany(company: Company): Partial<MaventaCompany> {
    return {
      name: company.name,
      bid: company.businessId,
      country: company.address.country === 'Finland' ? 'FI' : company.address.country,
      address: {
        street: company.address.street,
        city: company.address.city,
        zip: company.address.postalCode,
        country: company.address.country === 'Finland' ? 'FI' : company.address.country
      },
      email: company.email,
      phone: company.phone,
      vat_number: company.vatId
    };
  }

  convertFromMaventaCompany(maventaCompany: MaventaCompany): Company {
    return {
      id: maventaCompany.uuid,
      name: maventaCompany.name,
      businessId: maventaCompany.bid,
      vatId: maventaCompany.vat_number,
      address: {
        street: maventaCompany.address?.street || '',
        city: maventaCompany.address?.city || '',
        postalCode: maventaCompany.address?.zip || '',
        country: maventaCompany.country === 'FI' ? 'Finland' : maventaCompany.country
      },
      email: maventaCompany.email || '',
      phone: maventaCompany.phone
    };
  }

  convertToMaventaInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Partial<MaventaInvoice> {
    return {
      number: invoice.invoiceNumber,
      direction: 'SENT',
      sender: this.convertToMaventaCompany(invoice.sender),
      recipient: this.convertToMaventaCompany(invoice.recipient),
      date_created: invoice.issueDate,
      date_due: invoice.dueDate,
      sum: invoice.subtotal,
      sum_tax: invoice.vatAmount,
      sum_gross: invoice.total,
      currency: invoice.currency,
      comment: invoice.notes,
      items: invoice.items.map(item => ({
        name: item.description,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        vat_percent: item.vatRate,
        sum: item.unitPrice * item.quantity,
        sum_vat: (item.unitPrice * item.quantity) * (item.vatRate / 100),
        sum_gross: item.total
      }))
    };
  }

  convertFromMaventaInvoice(maventaInvoice: MaventaInvoice): Invoice {
    return {
      id: maventaInvoice.uuid,
      invoiceNumber: maventaInvoice.number,
      status: this.convertMaventaStatus(maventaInvoice.status),
      type: maventaInvoice.direction === 'SENT' ? 'outgoing' : 'incoming',
      sender: this.convertFromMaventaCompany(maventaInvoice.sender),
      recipient: this.convertFromMaventaCompany(maventaInvoice.recipient),
      issueDate: maventaInvoice.date_created,
      dueDate: maventaInvoice.date_due,
      items: maventaInvoice.items.map((item, index) => ({
        id: item.uuid || `item_${index}`,
        description: item.name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        vatRate: item.vat_percent,
        total: item.sum_gross
      })),
      subtotal: maventaInvoice.sum,
      vatAmount: maventaInvoice.sum_tax,
      total: maventaInvoice.sum_gross,
      currency: maventaInvoice.currency,
      notes: maventaInvoice.comment,
      createdAt: maventaInvoice.created_at,
      updatedAt: maventaInvoice.updated_at
    };
  }

  private convertMaventaStatus(status: MaventaInvoice['status']): Invoice['status'] {
    switch (status) {
      case 'DRAFT': return 'draft';
      case 'SENT': return 'sent';
      case 'DELIVERED': return 'delivered';
      case 'PAID': return 'paid';
      case 'REJECTED': return 'cancelled';
      case 'CANCELLED': return 'cancelled';
      default: return 'draft';
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  isTestMode(): boolean {
    return this.isTestMode;
  }

  logout() {
    localStorage.removeItem('maventa_tokens');
    this.accessToken = null;
    this.refreshToken = null;
  }
}

export const maventaService = new MaventaService();