import React from 'react';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';
import fiTranslations from '@shopify/polaris/locales/fi.json';

interface PolarisProviderProps {
  children: React.ReactNode;
}

export const PolarisProvider: React.FC<PolarisProviderProps> = ({ children }) => {
  // Combine English and Finnish translations
  // Use only English translations to avoid conflicts
  const translations = enTranslations;

  return (
    <AppProvider i18n={translations} features={{contextualSaveBar: true}}>
      {children}
    </AppProvider>
  );
};