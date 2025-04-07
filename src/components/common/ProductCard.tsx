
import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../../types/product';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { addToCart } from '../../services/apiService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const addToCartMutation = useMutation({
    mutationFn: () => addToCart(product.id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
      if (onAddToCart) onAddToCart();
    }
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleClick = () => {
    navigate(`/app/product/${product.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow overflow-hidden cursor-pointer transform transition hover:scale-[1.01]"
      onClick={handleClick}
    >
      <div className="relative">
        <img 
          src={product.images[0] || 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={product.name} 
          className="w-full h-44 object-cover"
        />
        {product.isFeatured && (
          <div className="absolute top-2 left-2 bg-farmsoc-secondary text-white text-xs px-2 py-1 rounded-md">
            Featured
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-800 line-clamp-1">{product.name}</h3>
          {product.farmingMethod === 'organic' && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">Organic</span>
          )}
        </div>
        <div className="flex items-center mt-1">
          <Star size={16} className="text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600 ml-1">
            {product.rating || 0} ({product.reviewCount || 0})
          </span>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div className="text-farmsoc-primary font-semibold">₹{product.price}</div>
          <button 
            className="p-2 bg-farmsoc-primary text-white rounded-full hover:bg-farmsoc-dark"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
