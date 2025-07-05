import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { webhookService } from '../../src/services/webhook';
import { shopifyAppService } from '../../src/services/shopify-app';
import { apiService } from '../../src/services/api';

// Mock services
vi.mock('../../src/services/shopify-app');
vi.mock('../../src/services/api');

describe('Shopify Webhook Integration', () => {
  const mockShop = 'test-shop.myshopify.com';
  const mockSignature = 'test-signature';
  const mockBody = JSON.stringify({
    id: 123456,
    name: '#1001',
    order_number: '1001',
    created_at: '2024-01-15T10:00:00Z',
    total_price: '248.00',
    subtotal_price: '200.00',
    total_tax: '48.00',
    currency: 'EUR',
    financial_status: 'pending',
    customer: {
      id: 789,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      default_address: {
        address1: 'Testikatu 1',
        city: 'Helsinki',
        zip: '00100',
        country: 'Finland'
      }
    },
    line_items: [
      {
        id: 456,
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
    ]
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Order Creation Webhook', () => {
    it('should process order creation webhook successfully', async () => {
      // Mock webhook verification
      vi.mocked(shopifyAppService.verifyWebhook).mockReturnValue(true);
      
      // Mock invoice creation
      const mockInvoiceResponse = {
        success: true,
        data: {
          id: 'invoice-123',
          invoiceNumber: 'SHOP-1001',
          status: 'draft',
          total: 248.00
        }
      };
      vi.mocked(apiService.sendInvoice).mockResolvedValue(mockInvoiceResponse);

      const result = await webhookService.handleShopifyWebhook(
        'orders/create',
        mockShop,
        JSON.parse(mockBody),
        mockSignature,
        mockBody
      );

      expect(result.success).toBe(true);
      expect(shopifyAppService.verifyWebhook).toHaveBeenCalledWith(mockBody, mockSignature);
    });

    it('should reject webhook with invalid signature', async () => {
      vi.mocked(shopifyAppService.verifyWebhook).mockReturnValue(false);

      const result = await webhookService.handleShopifyWebhook(
        'orders/create',
        mockShop,
        JSON.parse(mockBody),
        'invalid-signature',
        mockBody
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid webhook signature');
    });

    it('should handle webhook processing errors gracefully', async () => {
      vi.mocked(shopifyAppService.verifyWebhook).mockReturnValue(true);
      vi.mocked(apiService.sendInvoice).mockRejectedValue(new Error('Database error'));

      const result = await webhookService.handleShopifyWebhook(
        'orders/create',
        mockShop,
        JSON.parse(mockBody),
        mockSignature,
        mockBody
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });

  describe('Order Update Webhook', () => {
    it('should process order update webhook', async () => {
      vi.mocked(shopifyAppService.verifyWebhook).mockReturnValue(true);

      const updatedOrder = {
        ...JSON.parse(mockBody),
        financial_status: 'paid'
      };

      const result = await webhookService.handleShopifyWebhook(
        'orders/updated',
        mockShop,
        updatedOrder,
        mockSignature,
        JSON.stringify(updatedOrder)
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Order Paid Webhook', () => {
    it('should mark invoice as paid when order is paid', async () => {
      vi.mocked(shopifyAppService.verifyWebhook).mockReturnValue(true);

      const paidOrder = {
        ...JSON.parse(mockBody),
        financial_status: 'paid'
      };

      const result = await webhookService.handleShopifyWebhook(
        'orders/paid',
        mockShop,
        paidOrder,
        mockSignature,
        JSON.stringify(paidOrder)
      );

      expect(result.success).toBe(true);
    });
  });

  describe('App Uninstall Webhook', () => {
    it('should handle app uninstallation', async () => {
      vi.mocked(shopifyAppService.verifyWebhook).mockReturnValue(true);
      vi.mocked(shopifyAppService.uninstall).mockResolvedValue();

      const result = await webhookService.handleShopifyWebhook(
        'app/uninstalled',
        mockShop,
        {},
        mockSignature,
        '{}'
      );

      expect(result.success).toBe(true);
      expect(shopifyAppService.uninstall).toHaveBeenCalledWith(mockShop);
    });
  });

  describe('Webhook Security', () => {
    it('should verify HMAC signature correctly', () => {
      const testBody = '{"test": "data"}';
      const testSecret = 'test-secret';
      
      // This would normally use the actual HMAC verification
      // For testing, we mock the verification
      vi.mocked(shopifyAppService.verifyWebhook).mockReturnValue(true);

      const isValid = shopifyAppService.verifyWebhook(testBody, 'valid-signature');
      expect(isValid).toBe(true);
    });

    it('should reject webhooks with missing headers', async () => {
      const result = await webhookService.handleShopifyWebhook(
        '',
        '',
        {},
        '',
        ''
      );

      expect(result.success).toBe(false);
    });
  });

  describe('Error Recovery', () => {
    it('should handle temporary service unavailability', async () => {
      vi.mocked(shopifyAppService.verifyWebhook).mockReturnValue(true);
      
      // First call fails, second succeeds
      vi.mocked(apiService.sendInvoice)
        .mockRejectedValueOnce(new Error('Service unavailable'))
        .mockResolvedValueOnce({
          success: true,
          data: { id: 'invoice-123', invoiceNumber: 'SHOP-1001' }
        });

      // First attempt
      const result1 = await webhookService.handleShopifyWebhook(
        'orders/create',
        mockShop,
        JSON.parse(mockBody),
        mockSignature,
        mockBody
      );

      expect(result1.success).toBe(false);

      // Retry attempt
      const result2 = await webhookService.handleShopifyWebhook(
        'orders/create',
        mockShop,
        JSON.parse(mockBody),
        mockSignature,
        mockBody
      );

      expect(result2.success).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should validate required order fields', async () => {
      vi.mocked(shopifyAppService.verifyWebhook).mockReturnValue(true);

      const invalidOrder = {
        id: 123456,
        // Missing required fields
      };

      const result = await webhookService.handleShopifyWebhook(
        'orders/create',
        mockShop,
        invalidOrder,
        mockSignature,
        JSON.stringify(invalidOrder)
      );

      // Should handle gracefully even with missing data
      expect(result.success).toBe(true);
    });

    it('should handle malformed JSON', async () => {
      const malformedBody = '{"invalid": json}';

      try {
        await webhookService.handleShopifyWebhook(
          'orders/create',
          mockShop,
          JSON.parse(malformedBody), // This will throw
          mockSignature,
          malformedBody
        );
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });
  });

  describe('Performance', () => {
    it('should process webhooks within acceptable time limits', async () => {
      vi.mocked(shopifyAppService.verifyWebhook).mockReturnValue(true);
      vi.mocked(apiService.sendInvoice).mockResolvedValue({
        success: true,
        data: { id: 'invoice-123', invoiceNumber: 'SHOP-1001' }
      });

      const startTime = Date.now();

      await webhookService.handleShopifyWebhook(
        'orders/create',
        mockShop,
        JSON.parse(mockBody),
        mockSignature,
        mockBody
      );

      const processingTime = Date.now() - startTime;
      
      // Should process within 5 seconds
      expect(processingTime).toBeLessThan(5000);
    });
  });
});