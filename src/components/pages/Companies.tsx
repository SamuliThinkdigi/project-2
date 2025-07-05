import React, { useEffect, useState } from 'react';
import { Plus, Building, Mail, Phone, MapPin, Edit, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { Company } from '../../types/invoice';
import LoadingSpinner from '../LoadingSpinner';

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getCompanies();
      if (response.success && response.data) {
        setCompanies(response.data);
      } else {
        setError(response.error || 'Failed to load companies');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = () => {
    // In a real app, this would open a modal or form
    alert('Add company functionality would be implemented here');
  };

  const handleEditCompany = (company: Company) => {
    // In a real app, this would open an edit form
    alert(`Edit company: ${company.name}`);
  };

  const handleDeleteCompany = (company: Company) => {
    // In a real app, this would show a confirmation dialog
    if (confirm(`Are you sure you want to delete ${company.name}?`)) {
      alert(`Delete company: ${company.name}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-2">Manage your business partners and clients</p>
        </div>
        
        <button
          onClick={handleAddCompany}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadCompanies}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-500">{company.businessId}</p>
                </div>
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEditCompany(company)}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit company"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCompany(company)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete company"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <div>{company.address.street}</div>
                  <div>{company.address.postalCode} {company.address.city}</div>
                  <div>{company.address.country}</div>
                </div>
              </div>

              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <a
                  href={`mailto:${company.email}`}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {company.email}
                </a>
              </div>

              {company.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <a
                    href={`tel:${company.phone}`}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {company.phone}
                  </a>
                </div>
              )}

              {company.vatId && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">VAT ID: {company.vatId}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {companies.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first business partner.</p>
          <button
            onClick={handleAddCompany}
            className="flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </button>
        </div>
      )}
    </div>
  );
};

export default Companies;