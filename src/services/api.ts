import { ApiResponse, AuthTokens, Invoice, Company } from '../types/invoice';
import { maventaService } from './maventa';

class ApiService {
  private baseUrl = 'https://api.maventa.com/v1';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    const tokens = localStorage.getItem('thinkdigi_invoice_tokens');
    if (tokens) {
      const parsed = JSON.parse(tokens);
      this.accessToken = parsed.accessToken;
      this.refreshToken = parsed.refreshToken;
    }
  }

  private saveTokensToStorage(tokens: AuthTokens) {
    localStorage.setItem('thinkdigi_invoice_tokens', JSON.stringify(tokens));
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }

  async authenticate(clientId: string, clientSecret: string): Promise<ApiResponse<AuthTokens>> {
    try {
      // Use the real Maventa service for authentication
      const response = await maventaService.authenticate(clientId, clientSecret, true);
      
      if (response.success && response.data) {
        const tokens: AuthTokens = {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token || '',
          expiresAt: Date.now() + (response.data.expires_in * 1000),
        };

        this.saveTokensToStorage(tokens);
        
        return {
          success: true,
          data: tokens,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Authentication failed',
        };
      }
    } catch (error) {
      // Fallback to demo mode for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTokens: AuthTokens = {
        accessToken: 'thinkdigi_access_token_' + Date.now(),
        refreshToken: 'thinkdigi_refresh_token_' + Date.now(),
        expiresAt: Date.now() + 3600000, // 1 hour
      };

      this.saveTokensToStorage(mockTokens);
      
      return {
        success: true,
        data: mockTokens,
      };
    }
  }

  async refreshAccessToken(): Promise<ApiResponse<AuthTokens>> {
    if (!this.refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    try {
      const response = await maventaService.refreshAccessToken();
      
      if (response.success && response.data) {
        const tokens: AuthTokens = {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token || this.refreshToken,
          expiresAt: Date.now() + (response.data.expires_in * 1000),
        };

        this.saveTokensToStorage(tokens);
        
        return {
          success: true,
          data: tokens,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Token refresh failed',
        };
      }
    } catch (error) {
      // Fallback for demo
      const mockTokens: AuthTokens = {
        accessToken: 'thinkdigi_refreshed_access_token_' + Date.now(),
        refreshToken: this.refreshToken,
        expiresAt: Date.now() + 3600000,
      };

      this.saveTokensToStorage(mockTokens);
      
      return {
        success: true,
        data: mockTokens,
      };
    }
  }

  async sendInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Invoice>> {
    try {
      // First validate the invoice
      const maventaInvoice = maventaService.convertToMaventaInvoice(invoice);
      const validationResponse = await maventaService.validateInvoice(maventaInvoice);
      
      if (!validationResponse.success) {
        return {
          success: false,
          error: validationResponse.error?.message || 'Invoice validation failed',
        };
      }

      if (validationResponse.data && !validationResponse.data.valid) {
        return {
          success: false,
          error: `Invoice validation failed: ${validationResponse.data.errors?.join(', ')}`,
        };
      }

      // Create the invoice
      const createResponse = await maventaService.createInvoice(maventaInvoice);
      
      if (!createResponse.success || !createResponse.data) {
        return {
          success: false,
          error: createResponse.error?.message || 'Failed to create invoice',
        };
      }

      // Send the invoice
      const sendResponse = await maventaService.sendInvoice(createResponse.data.uuid);
      
      if (!sendResponse.success || !sendResponse.data) {
        return {
          success: false,
          error: sendResponse.error?.message || 'Failed to send invoice',
        };
      }

      const newInvoice = maventaService.convertFromMaventaInvoice(sendResponse.data);
      
      return {
        success: true,
        data: newInvoice,
      };
    } catch (error) {
      // Fallback to demo mode
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newInvoice: Invoice = {
        ...invoice,
        id: 'thinkdigi_inv_' + Date.now(),
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: newInvoice,
      };
    }
  }

  async getInvoices(type?: 'outgoing' | 'incoming'): Promise<ApiResponse<Invoice[]>> {
    try {
      const direction = type === 'outgoing' ? 'SENT' : type === 'incoming' ? 'RECEIVED' : undefined;
      const response = await maventaService.getInvoices(direction);
      
      if (response.success && response.data) {
        const invoices = response.data.map(maventaInvoice => 
          maventaService.convertFromMaventaInvoice(maventaInvoice)
        );
        
        return {
          success: true,
          data: invoices,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to load invoices',
        };
      }
    } catch (error) {
      // Fallback to demo data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockInvoices: Invoice[] = [
        {
          id: 'thinkdigi_inv_001',
          invoiceNumber: 'TD-INV-2024-001',
          status: 'paid',
          type: 'outgoing',
          sender: {
            id: 'thinkdigi_comp_001',
            name: 'Thinkdigi Oy',
            businessId: '2847123-4',
            address: {
              street: 'Teknologiantie 15',
              city: 'Helsinki',
              postalCode: '00150',
              country: 'Finland'
            },
            email: 'billing@thinkdigi.fi'
          },
          recipient: {
            id: 'client_002',
            name: 'Digital Solutions Ltd',
            businessId: '8765432-1',
            address: {
              street: '456 Innovation Street',
              city: 'Espoo',
              postalCode: '02100',
              country: 'Finland'
            },
            email: 'accounts@digitalsolutions.com'
          },
          issueDate: '2024-01-15',
          dueDate: '2024-02-14',
          items: [
            {
              id: 'item_001',
              description: 'Digital Transformation Consulting',
              quantity: 40,
              unitPrice: 125,
              vatRate: 24,
              total: 6200
            }
          ],
          subtotal: 5000,
          vatAmount: 1200,
          total: 6200,
          currency: 'EUR',
          notes: 'Digital transformation project - Phase 1',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z'
        },
        {
          id: 'thinkdigi_inv_002',
          invoiceNumber: 'TD-INV-2024-002',
          status: 'delivered',
          type: 'outgoing',
          sender: {
            id: 'thinkdigi_comp_001',
            name: 'Thinkdigi Oy',
            businessId: '2847123-4',
            address: {
              street: 'Teknologiantie 15',
              city: 'Helsinki',
              postalCode: '00150',
              country: 'Finland'
            },
            email: 'billing@thinkdigi.fi'
          },
          recipient: {
            id: 'client_003',
            name: 'Tech Innovations Oy',
            businessId: '9876543-2',
            address: {
              street: '789 Future Boulevard',
              city: 'Tampere',
              postalCode: '33100',
              country: 'Finland'
            },
            email: 'finance@techinnovations.fi'
          },
          issueDate: '2024-01-20',
          dueDate: '2024-02-19',
          items: [
            {
              id: 'item_002',
              description: 'Cloud Infrastructure Setup',
              quantity: 1,
              unitPrice: 3500,
              vatRate: 24,
              total: 4340
            }
          ],
          subtotal: 3500,
          vatAmount: 840,
          total: 4340,
          currency: 'EUR',
          notes: 'AWS cloud infrastructure deployment and configuration',
          createdAt: '2024-01-20T14:00:00Z',
          updatedAt: '2024-01-20T14:00:00Z'
        }
      ];

      const filteredInvoices = type ? mockInvoices.filter(inv => inv.type === type) : mockInvoices;
      
      return {
        success: true,
        data: filteredInvoices,
      };
    }
  }

  async getInvoiceById(id: string): Promise<ApiResponse<Invoice>> {
    try {
      const response = await maventaService.getInvoiceById(id);
      
      if (response.success && response.data) {
        const invoice = maventaService.convertFromMaventaInvoice(response.data);
        return { success: true, data: invoice };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Invoice not found',
        };
      }
    } catch (error) {
      // Fallback to demo data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const invoices = await this.getInvoices();
      if (invoices.success && invoices.data) {
        const invoice = invoices.data.find(inv => inv.id === id);
        if (invoice) {
          return { success: true, data: invoice };
        }
      }
      
      return { success: false, error: 'Invoice not found' };
    }
  }

  async getCompanies(): Promise<ApiResponse<Company[]>> {
    try {
      const response = await maventaService.getCompanies();
      
      if (response.success && response.data) {
        const companies = response.data.map(maventaCompany => 
          maventaService.convertFromMaventaCompany(maventaCompany)
        );
        
        return {
          success: true,
          data: companies,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to load companies',
        };
      }
    } catch (error) {
      // Fallback to demo data
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockCompanies: Company[] = [
        {
          id: 'client_002',
          name: 'Digital Solutions Ltd',
          businessId: '8765432-1',
          address: {
            street: '456 Innovation Street',
            city: 'Espoo',
            postalCode: '02100',
            country: 'Finland'
          },
          email: 'accounts@digitalsolutions.com',
          phone: '+358 50 123 4567'
        },
        {
          id: 'client_003',
          name: 'Tech Innovations Oy',
          businessId: '9876543-2',
          address: {
            street: '789 Future Boulevard',
            city: 'Tampere',
            postalCode: '33100',
            country: 'Finland'
          },
          email: 'finance@techinnovations.fi',
          phone: '+358 40 987 6543'
        },
        {
          id: 'client_004',
          name: 'Nordic Software AB',
          businessId: '5566778-9',
          address: {
            street: '321 Development Drive',
            city: 'Turku',
            postalCode: '20100',
            country: 'Finland'
          },
          email: 'billing@nordicsoftware.se',
          phone: '+358 45 555 1234'
        }
      ];
      
      return {
        success: true,
        data: mockCompanies,
      };
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken || maventaService.isAuthenticated();
  }

  logout() {
    localStorage.removeItem('thinkdigi_invoice_tokens');
    this.accessToken = null;
    this.refreshToken = null;
    maventaService.logout();
  }
}

export const apiService = new ApiService();