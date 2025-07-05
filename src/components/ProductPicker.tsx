import React, { useState, useEffect } from 'react';
import { Search, Package, Plus, X, ShoppingBag } from 'lucide-react';
import { ShopifyProduct, ShopifyVariant } from '../types/shopify';
import { shopifyService } from '../services/shopify';

interface ProductPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: ShopifyProduct, variant: ShopifyVariant) => void;
}

const ProductPicker: React.FC<ProductPickerProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = shopifyService.searchProducts(searchTerm);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const loadProducts = () => {
    setLoading(true);
    const storedProducts = shopifyService.getStoredProducts();
    setProducts(storedProducts);
    setFilteredProducts(storedProducts);
    setLoading(false);
  };

  const handleProductSelect = (product: ShopifyProduct) => {
    if (product.variants.length === 1) {
      // If only one variant, select it directly
      onSelectProduct(product, product.variants[0]);
      onClose();
    } else {
      // Show variant selection
      setSelectedProduct(product);
    }
  };

  const handleVariantSelect = (variant: ShopifyVariant) => {
    if (selectedProduct) {
      onSelectProduct(selectedProduct, variant);
      onClose();
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedProduct(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl mr-3">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {selectedProduct ? 'Select Variant' : 'Choose Product'}
              </h2>
              <p className="text-slate-600">
                {selectedProduct ? `Variants for ${selectedProduct.title}` : 'Select a product from your Shopify store'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!selectedProduct && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by name, SKU, vendor, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : selectedProduct ? (
              // Variant selection view
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4"
                >
                  ← Back to products
                </button>
                {selectedProduct.variants.map((variant) => (
                  <div
                    key={variant.id}
                    onClick={() => handleVariantSelect(variant)}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {variant.title === 'Default Title' ? selectedProduct.title : variant.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                        {variant.sku && <span>SKU: {variant.sku}</span>}
                        <span>€{parseFloat(variant.price).toFixed(2)}</span>
                        <span>Stock: {variant.inventory_quantity}</span>
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                ))}
              </div>
            ) : (
              // Product selection view
              <div className="space-y-3">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">
                      {products.length === 0 ? 'No products found' : 'No products match your search'}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      {products.length === 0 ? 'Sync your Shopify products first' : 'Try a different search term'}
                    </p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      {product.image && (
                        <img
                          src={product.image.src}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded-lg mr-4 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{product.title}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                          <span>{product.vendor}</span>
                          <span>{product.product_type}</span>
                          <span>{product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          €{parseFloat(product.variants[0]?.price || '0').toFixed(2)}
                          {product.variants.length > 1 && ' - €' + Math.max(...product.variants.map(v => parseFloat(v.price))).toFixed(2)}
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPicker;