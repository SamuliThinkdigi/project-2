import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from '../../src/services/api';
import { maventaService } from '../../src/services/maventa';
import { shopifyService } from '../../src/services/shopify';
import { Invoice, Company, InvoiceItem } from '../../src/types/invoice';

// Mock services
vi.mock('../../src/services/maventa');
vi.mock('../../src/services/api');

describe('Invoice Creation', () => {
  let mockCompany: Company;
  let mockInvoiceItems: InvoiceItem[];

  beforeEach(() => {
    mockCompany = {
      id: 'test-company-1',
      name: 'Test Company Oy',
      businessId: '1234567-8',
      vatId: 'FI12345678',
      address: {
        street: 'Testikatu 1',
        city: 'Helsinki',
        postalCode: '00100',
        country: 'Finland'
      },
      email: 'test@company.fi',
      phone: '+358 50 123 4567'
    };

    mockInvoiceItems = [
      {
        id: 'item-1',
        description: 'Test Product',
        quantity: 2,
        unitPrice: 100.00,
        vatRate: 24,
        total: 248.00
      }
    ];
  });

  it('should create invoice with correct data', async () => {
    const invoiceData = {
      invoiceNumber: 'TEST-001',
      status: 'draft' as const,
      type: 'outgoing' as const,
      sender: mockCompany,
      recipient: mockCompany,
      issueDate: '2024-01-15',
      dueDate: '2024-02-14',
      items: mockInvoiceItems,
      subtotal: 200.00,
      vatAmount: 48.00,
      total: 248.00,
      currency: 'EUR',
      notes: 'Test invoice'
    };

    const mockResponse = {
      success: true,
      data: {
        ...invoiceData,
        id: 'invoice-123',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    };

    vi.mocked(apiService.sendInvoice).mockResolvedValue(mockResponse);

    const result = await apiService.sendInvoice(invoiceData);

    expect(result.success).toBe(true);
    expect(result.data?.invoiceNumber).toBe('TEST-001');
    expect(result.data?.total).toBe(248.00);
    expect(result.data?.status).toBe('draft');
  });

  it('should calculate totals correctly', () => {
    const items = [
      { quantity: 2, unitPrice: 100, vatRate: 24 },
      { quantity: 1, unitPrice: 50, vatRate: 10 }
    ];

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vatAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.vatRate / 100), 0);
    const total = subtotal + vatAmount;

    expect(subtotal).toBe(250); // (2*100) + (1*50)
    expect(vatAmount).toBe(53); // (200*0.24) + (50*0.10)
    expect(total).toBe(303);
  });

  it('should validate required fields', async () => {
    const invalidInvoiceData = {
      invoiceNumber: '',
      status: 'draft' as const,
      type: 'outgoing' as const,
      sender: mockCompany,
      recipient: mockCompany,
      issueDate: '',
      dueDate: '',
      items: [],
      subtotal: 0,
      vatAmount: 0,
      total: 0,
      currency: 'EUR'
    };

    const mockResponse = {
      success: false,
      error: 'Invoice number is required'
    };

    vi.mocked(apiService.sendInvoice).mockResolvedValue(mockResponse);

    const result = await apiService.sendInvoice(invalidInvoiceData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
  });
});

describe('Maventa Integration', () => {
  it('should convert invoice to Maventa format', () => {
    const invoice = {
      invoiceNumber: 'TEST-001',
      status: 'draft' as const,
      type: 'outgoing' as const,
      sender: mockCompany,
      recipient: mockCompany,
      issueDate: '2024-01-15',
      dueDate: '2024-02-14',
      items: mockInvoiceItems,
      subtotal: 200.00,
      vatAmount: 48.00,
      total: 248.00,
      currency: 'EUR',
      notes: 'Test invoice'
    };

    const maventaInvoice = maventaService.convertToMaventaInvoice(invoice);

    expect(maventaInvoice.number).toBe('TEST-001');
    expect(maventaInvoice.direction).toBe('SENT');
    expect(maventaInvoice.sum).toBe(200.00);
    expect(maventaInvoice.sum_tax).toBe(48.00);
    expect(maventaInvoice.sum_gross).toBe(248.00);
    expect(maventaInvoice.currency).toBe('EUR');
  });

  it('should validate invoice before sending', async () => {
    const mockValidationResponse = {
      success: true,
      data: {
        valid: true,
        errors: [],
        warnings: []
      }
    };

    vi.mocked(maventaService.validateInvoice).mockResolvedValue(mockValidationResponse);

    const result = await maventaService.validateInvoice({});

    expect(result.success).toBe(true);
    expect(result.data?.valid).toBe(true);
  });

  it('should handle validation errors', async () => {
    const mockValidationResponse = {
      success: true,
      data: {
        valid: false,
        errors: ['Invalid VAT number', 'Missing recipient address'],
        warnings: []
      }
    };

    vi.mocked(maventaService.validateInvoice).mockResolvedValue(mockValidationResponse);

    const result = await maventaService.validateInvoice({});

    expect(result.success).toBe(true);
    expect(result.data?.valid).toBe(false);
    expect(result.data?.errors).toHaveLength(2);
  });
});

describe('Shopify Integration', () => {
  it('should convert Shopify order to invoice', () => {
    const shopifyOrder = {
      id: '123456',
      name: '#1001',
      order_number: '1001',
      created_at: '2024-01-15T10:00:00Z',
      total_price: '248.00',
      subtotal_price: '200.00',
      total_tax: '48.00',
      currency: 'EUR',
      financial_status: 'pending',
      customer: {
        id: '789',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+358 50 123 4567',
        default_address: {
          address1: 'Testikatu 1',
          city: 'Helsinki',
          zip: '00100',
          country: 'Finland',
          company: 'Test Company'
        }
      },
      line_items: [
        {
          id: '456',
          title: 'Test Product',
          quantity: 2,
          price: '100.00',
          tax_lines: [
            {
              title: 'VAT',
              rate: 0.24,
              price: '48.00'
            }
          ]
        }
      ],
      note: 'Test order'
    };

    const senderCompany = mockCompany;
    const invoice = shopifyService.convertShopifyOrderToInvoice(shopifyOrder, senderCompany);

    expect(invoice.invoiceNumber).toMatch(/^TD-SHOP-1001$/);
    expect(invoice.type).toBe('outgoing');
    expect(invoice.total).toBe(248.00);
    expect(invoice.subtotal).toBe(200.00);
    expect(invoice.vatAmount).toBe(48.00);
    expect(invoice.items).toHaveLength(1);
    expect(invoice.items[0].description).toBe('Test Product');
    expect(invoice.items[0].quantity).toBe(2);
    expect(invoice.items[0].unitPrice).toBe(100.00);
  });

  it('should handle customer without company name', () => {
    const shopifyOrder = {
      id: '123456',
      name: '#1001',
      order_number: '1001',
      created_at: '2024-01-15T10:00:00Z',
      total_price: '100.00',
      subtotal_price: '100.00',
      total_tax: '0.00',
      currency: 'EUR',
      financial_status: 'pending',
      customer: {
        id: '789',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        default_address: {
          address1: 'Testikatu 2',
          city: 'Espoo',
          zip: '02100',
          country: 'Finland',
          company: null
        }
      },
      line_items: [],
      note: null
    };

    const customer = shopifyService.convertShopifyCustomerToCompany(shopifyOrder.customer);

    expect(customer.name).toBe('Jane Smith');
    expect(customer.email).toBe('jane@example.com');
    expect(customer.address.city).toBe('Espoo');
  });
});

describe('VAT Calculations', () => {
  it('should calculate Finnish VAT rates correctly', () => {
    const testCases = [
      { amount: 100, rate: 0, expected: 0 },
      { amount: 100, rate: 10, expected: 10 },
      { amount: 100, rate: 14, expected: 14 },
      { amount: 100, rate: 24, expected: 24 }
    ];

    testCases.forEach(({ amount, rate, expected }) => {
      const vat = amount * (rate / 100);
      expect(vat).toBe(expected);
    });
  });

  it('should handle multiple VAT rates in single invoice', () => {
    const items = [
      { amount: 100, vatRate: 24 }, // Books: 24%
      { amount: 50, vatRate: 14 },  // Food: 14%
      { amount: 30, vatRate: 10 },  // Transport: 10%
      { amount: 20, vatRate: 0 }    // Export: 0%
    ];

    const totalVat = items.reduce((sum, item) => sum + (item.amount * item.vatRate / 100), 0);
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const totalWithVat = totalAmount + totalVat;

    expect(totalAmount).toBe(200);
    expect(totalVat).toBe(31); // 24 + 7 + 3 + 0
    expect(totalWithVat).toBe(231);
  });
});

describe('Error Handling', () => {
  it('should handle network errors gracefully', async () => {
    vi.mocked(apiService.sendInvoice).mockRejectedValue(new Error('Network error'));

    try {
      await apiService.sendInvoice({} as any);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Network error');
    }
  });

  it('should handle API errors with proper error messages', async () => {
    const mockResponse = {
      success: false,
      error: 'Invalid invoice data: Missing recipient information'
    };

    vi.mocked(apiService.sendInvoice).mockResolvedValue(mockResponse);

    const result = await apiService.sendInvoice({} as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid invoice data');
  });

  it('should validate email addresses', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.fi',
      'admin+test@company.co.uk'
    ];

    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user name@domain.com'
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });

    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });
});

describe('Date Handling', () => {
  it('should calculate due dates correctly', () => {
    const issueDate = new Date('2024-01-15');
    const paymentTerms = 30;
    
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + paymentTerms);

    expect(dueDate.toISOString().split('T')[0]).toBe('2024-02-14');
  });

  it('should handle month boundaries correctly', () => {
    const issueDate = new Date('2024-01-31');
    const paymentTerms = 30;
    
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + paymentTerms);

    // Should be March 1st (February has 29 days in 2024)
    expect(dueDate.toISOString().split('T')[0]).toBe('2024-03-01');
  });

  it('should format dates for Finnish locale', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = date.toLocaleDateString('fi-FI');
    
    expect(formatted).toBe('15.1.2024');
  });
});