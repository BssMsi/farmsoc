import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FarmerAddContent: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the product page by default
    navigate('/app/add/product', { replace: true });
  }, [navigate]);

  return null; // This component should not render anything, just redirect
};

export default FarmerAddContent;
