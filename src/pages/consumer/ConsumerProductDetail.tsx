
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
        <div className="w-12 h-12 border-4 border-farmsoc-light border-t-farmsoc-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-4">The product you're looking for doesn't exist or has been removed.</p>
        <button 
          className="px-4 py-2 bg-farmsoc-primary text-white rounded-lg"
          onClick={() => navigate('/app/explore')}
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-white pb-16">
      {/* Header */}
      <div className="p-4 flex items-center border-b">
        <button 
          className="p-1 mr-2 text-gray-700"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold">Product Details</h1>
      </div>
      
      {/* Product images */}
      <div className="relative">
        <img 
          src={product.images[activeImageIndex] || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={product.name} 
          className="w-full h-64 object-cover"
        />
        
        {/* Image indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
            {product.images.map((_, index) => (
              <button 
                key={index} 
                onClick={() => setActiveImageIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Product badges */}
        <div className="absolute top-2 left-2 flex space-x-2">
          {product.farmingMethod === 'organic' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
              Organic
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-1 bg-farmsoc-secondary text-white text-xs rounded-md">
              Featured
            </span>
          )}
        </div>
      </div>
      
      {/* Product info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <div className="flex items-center mt-1">
              <Star size={16} className="text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {product.rating || '0'} ({product.reviewCount || '0'} reviews)
              </span>
            </div>
          </div>
          <div className="text-xl font-bold text-farmsoc-primary">
            ₹{product.price}/{product.unit}
          </div>
        </div>
        
        {/* Quantity selector */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-gray-700">Quantity:</div>
          <div className="flex items-center border rounded">
            <button 
              className="px-3 py-1 text-gray-500"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="px-4 py-1 border-x">{quantity}</span>
            <button 
              className="px-3 py-1 text-gray-500"
              onClick={incrementQuantity}
            >
              +
            </button>
          </div>
        </div>
        
        {/* Add to cart button */}
        <button 
          className="w-full py-3 mt-4 bg-farmsoc-primary text-white rounded-lg font-medium flex items-center justify-center"
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending}
        >
          <ShoppingCart size={20} className="mr-2" />
          {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
        </button>
        
        {/* Collapsible sections */}
        <div className="mt-6 space-y-4">
          {/* Description */}
          <div className="border rounded-lg overflow-hidden">
            <button 
              className="w-full p-4 flex justify-between items-center"
              onClick={() => setShowDescription(!showDescription)}
            >
              <span className="font-medium">Description</span>
              {showDescription ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            
            {showDescription && (
              <div className="p-4 pt-0 text-gray-700">
                <p>{product.description}</p>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Category</div>
                    <div className="font-medium capitalize">{product.category}</div>
                  </div>
                  
                  {product.farmingMethod && (
                    <div>
                      <div className="text-sm text-gray-500">Farming Method</div>
                      <div className="font-medium capitalize">{product.farmingMethod}</div>
                    </div>
                  )}
                  
                  {product.availabilityDate && (
                    <div>
                      <div className="text-sm text-gray-500">Harvest Date</div>
                      <div className="font-medium">
                        {new Date(product.availabilityDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm text-gray-500">Available Quantity</div>
                    <div className="font-medium">{product.quantity} {product.unit}</div>
                  </div>
                </div>
                
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-500 mb-1">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Nutritional Info */}
          <div className="border rounded-lg overflow-hidden">
            <button 
              className="w-full p-4 flex justify-between items-center"
              onClick={() => setShowNutrition(!showNutrition)}
            >
              <span className="font-medium">Nutritional Information</span>
              {showNutrition ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
            
            {showNutrition && (
              <div className="p-4 pt-0 text-gray-700">
                {product.nutritionalInfo ? (
                  <div className="space-y-2">
                    {product.nutritionalInfo.calories !== undefined && (
                      <div className="flex justify-between">
                        <span>Calories</span>
                        <span>{product.nutritionalInfo.calories} kcal</span>
                      </div>
                    )}
                    {product.nutritionalInfo.proteins !== undefined && (
                      <div className="flex justify-between">
                        <span>Proteins</span>
                        <span>{product.nutritionalInfo.proteins} g</span>
                      </div>
                    )}
                    {product.nutritionalInfo.carbohydrates !== undefined && (
                      <div className="flex justify-between">
                        <span>Carbohydrates</span>
                        <span>{product.nutritionalInfo.carbohydrates} g</span>
                      </div>
                    )}
                    {product.nutritionalInfo.fats !== undefined && (
                      <div className="flex justify-between">
                        <span>Fats</span>
                        <span>{product.nutritionalInfo.fats} g</span>
                      </div>
                    )}
                    {product.nutritionalInfo.fiber !== undefined && (
                      <div className="flex justify-between">
                        <span>Fiber</span>
                        <span>{product.nutritionalInfo.fiber} g</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>Nutritional information is not available for this product.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerProductDetail;
