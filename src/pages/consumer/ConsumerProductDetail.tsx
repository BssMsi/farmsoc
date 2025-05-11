import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct, addToCart } from '../../services/apiService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

const ConsumerProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(true);
  const [showNutrition, setShowNutrition] = useState(false);
  
  // Get product
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id || ''),
    enabled: !!id
  });
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: () => addToCart(id || '', quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Added to cart",
        description: `${product?.name} has been added to your cart`,
      });
    }
  });
  
  const handleAddToCart = () => {
    if (user?.role !== 'consumer') {
      toast({
        title: "Operation not allowed",
        description: "Only consumers can add items to cart",
        variant: "destructive"
      });
      return;
    }
    addToCartMutation.mutate();
  };
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-kisanly-light border-t-kisanly-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-4">The product you're looking for doesn't exist or has been removed.</p>
        <button 
          className="px-4 py-2 bg-kisanly-primary text-white rounded-lg"
          onClick={() => navigate('/app/explore')}
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 ml-4">{product?.name}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                <img
                  src={product?.images[activeImageIndex]}
                  alt={product?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex space-x-2">
                {product?.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden ${
                      activeImageIndex === index ? 'ring-2 ring-kisanly-primary' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product?.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-gray-900">₹{product?.price}</span>
                  <span className="text-gray-500 ml-2">per {product?.unit}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1 text-gray-900">{product?.rating}</span>
                  <span className="text-gray-500 ml-1">({product?.reviewCount} reviews)</span>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600">{product?.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Category</h2>
                <p className="text-gray-600 capitalize">{product?.category}</p>
              </div>

              {product?.farmingMethod && (
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Farming Method</h2>
                  <p className="text-gray-600 capitalize">{product?.farmingMethod}</p>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Quantity</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={decrementQuantity}
                      className="p-2 text-gray-600 hover:bg-gray-100"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </button>
                    <span className="px-4 py-2">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="p-2 text-gray-600 hover:bg-gray-100"
                    >
                      <ChevronUp className="h-5 w-5" />
                    </button>
                  </div>
                  <span className="text-gray-500">{product?.unit}</span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-kisanly-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-kisanly-primary/90 transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerProductDetail;
