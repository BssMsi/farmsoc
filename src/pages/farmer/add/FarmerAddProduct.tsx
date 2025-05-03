import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import AddContentTabs from '../components/shared/AddContentTabs';
import { ProductCategory } from '../../../types/product';

const FarmerAddProduct: React.FC = () => {
  const location = useLocation();
  const [formInitialValues, setFormInitialValues] = useState<{
    name?: string;
    description?: string;
    price?: string;
    category?: ProductCategory;
    quantity?: string;
    unit?: 'kg' | 'g' | 'pieces' | 'bundle' | 'liter' | 'ml';
  }>({});

  useEffect(() => {
    // Parse query parameters
    const searchParams = new URLSearchParams(location.search);
    const initialValues: any = {};

    // Extract parameters that match form fields
    if (searchParams.has('name')) initialValues.name = searchParams.get('name') || '';
    if (searchParams.has('description')) initialValues.description = searchParams.get('description') || '';
    if (searchParams.has('price')) initialValues.price = searchParams.get('price') || '';
    if (searchParams.has('category')) initialValues.category = searchParams.get('category') as ProductCategory;
    if (searchParams.has('quantity')) initialValues.quantity = searchParams.get('quantity') || '';
    if (searchParams.has('unit')) initialValues.unit = searchParams.get('unit') as 'kg' | 'g' | 'pieces' | 'bundle' | 'liter' | 'ml';

    setFormInitialValues(initialValues);
  }, [location.search]);

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <AddContentTabs />
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <ProductForm initialValues={formInitialValues} />
        </div>
      </div>
    </div>
  );
};

export default FarmerAddProduct; 