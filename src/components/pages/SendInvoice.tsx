import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Send, Zap, Package } from 'lucide-react';
import { apiService } from '../../services/api';
import { shopifyService } from '../../services/shopify';
import { Company, Invoice, InvoiceItem } from '../../types/invoice';
import { ShopifyProduct, ShopifyVariant } from '../../types/shopify';
import LoadingSpinner from '../LoadingSpinner';
import ProductPicker from '../ProductPicker';

const SendInvoice: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [isShopifyConfigured, setIsShopifyConfigured] = useState(false);

  const [formData, setFormData] = useState({
    invoiceNumber: `TD-INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    recipientId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'EUR',
    notes: '',
  });

  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'total'>[]>([
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      vatRate: 24,
    },
  ]);

  useEffect(() => {
    loadCompanies();
    checkShopifyIntegration();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    const response = await apiService.getCompanies();
    if (response.success && response.data) {
      setCompanies(response.data);
    } else {
      setError(response.error || 'Failed to load companies');
    }
    setLoading(false);
  };

  const checkShopifyIntegration = () => {
    setIsShopifyConfigured(shopifyService.isConfigured());
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, vatRate: 24 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof typeof items[0], value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleProductSelect = (product: ShopifyProduct, variant: ShopifyVariant) => {
    const newItem = {
      description: variant.title === 'Default Title' ? product.title : `${product.title} - ${variant.title}`,
      quantity: 1,
      unitPrice: parseFloat(variant.price),
      vatRate: variant.taxable ? 24 : 0, // Default Finnish VAT rate for taxable items
    };

    setItems([...items, newItem]);
  };

  const calculateItemTotal = (item: typeof items[0]) => {
    const subtotal = item.quantity * item.unitPrice;
    const vatAmount = subtotal * (item.vatRate / 100);
    return subtotal + vatAmount;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vatAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.vatRate / 100), 0);
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedRecipient = companies.find(c => c.id === formData.recipientId);
      if (!selectedRecipient) {
        throw new Error('Please select a recipient');
      }

      const { subtotal, vatAmount, total } = calculateTotals();
      
      const invoiceItems: InvoiceItem[] = items.map((item, index) => ({
        ...item,
        id: `item_${index}`,
        total: calculateItemTotal(item),
      }));

      const invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
        invoiceNumber: formData.invoiceNumber,
        status: 'draft',
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
        recipient: selectedRecipient,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        items: invoiceItems,
        subtotal,
        vatAmount,
        total,
        currency: formData.currency,
        notes: formData.notes || undefined,
      };

      const response = await apiService.sendInvoice(invoice);
      if (response.success) {
        setSuccess('Invoice sent successfully via Thinkdigi Invoice Hub!');
        // Reset form
        setFormData({
          ...formData,
          invoiceNumber: `TD-INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        });
        setItems([{ description: '', quantity: 1, unitPrice: 0, vatRate: 24 }]);
      } else {
        setError(response.error || 'Failed to send invoice');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center">
          <Zap className="w-5 h-5 text-emerald-600 mr-2" />
          <p className="text-emerald-600">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl mr-3">
              <Send className="w-5 h-5 text-white" />
            </div>
            Invoice Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Recipient
              </label>
              <select
                value={formData.recipientId}
                onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} ({company.businessId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Additional notes or payment terms..."
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-xl mr-3">
                <Plus className="w-5 h-5 text-white" />
              </div>
              Invoice Items
            </h2>
            <div className="flex space-x-3">
              {isShopifyConfigured && (
                <button
                  type="button"
                  onClick={() => setShowProductPicker(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Add from Store
                </button>
              )}
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-6 bg-slate-50 rounded-xl">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Item description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Unit Price (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    VAT %
                  </label>
                  <select
                    value={item.vatRate}
                    onChange={(e) => updateItem(index, 'vatRate', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="0">0%</option>
                    <option value="10">10%</option>
                    <option value="14">14%</option>
                    <option value="24">24%</option>
                  </select>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Total
                    </label>
                    <p className="px-3 py-2 bg-slate-100 rounded-lg font-bold text-slate-900">
                      €{calculateItemTotal(item).toFixed(2)}
                    </p>
                  </div>
                  
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
            <div className="space-y-3">
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">Subtotal:</span>
                <span className="font-semibold">€{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">VAT:</span>
                <span className="font-semibold">€{totals.vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-slate-900 border-t pt-3">
                <span>Total:</span>
                <span>€{totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
          >
            {submitting ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Send className="w-5 h-5 mr-2" />
            )}
            Send Invoice
          </button>
        </div>
      </form>

      <ProductPicker
        isOpen={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        onSelectProduct={handleProductSelect}
      />
    </div>
  );
};

export default SendInvoice;