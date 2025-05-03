import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PostForm from '../components/PostForm';
import AddContentTabs from '../components/shared/AddContentTabs';

const FarmerAddPost: React.FC = () => {
  const location = useLocation();
  const [formInitialValues, setFormInitialValues] = useState<{
    content?: string;
    location?: string;
    productId?: string;
  }>({});

  useEffect(() => {
    // Parse query parameters
    const searchParams = new URLSearchParams(location.search);
    const initialValues: any = {};

    // Extract parameters that match form fields
    if (searchParams.has('content')) initialValues.content = searchParams.get('content') || '';
    if (searchParams.has('location')) initialValues.location = searchParams.get('location') || '';
    if (searchParams.has('productId')) initialValues.productId = searchParams.get('productId') || '';

    setFormInitialValues(initialValues);
  }, [location.search]);

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <AddContentTabs />
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <PostForm initialValues={formInitialValues} />
        </div>
      </div>
    </div>
  );
};

export default FarmerAddPost; 