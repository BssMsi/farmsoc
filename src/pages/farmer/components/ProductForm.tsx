import React, { useState } from 'react';
import { IndianRupee } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { createProduct } from '../../../services/apiService';
import { ProductCategory } from '../../../types/product';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from './shared/ImageUpload';

interface ProductFormProps {
  onProductCreated?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onProductCreated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [productCategory, setProductCategory] = useState<ProductCategory>('vegetables');
  const [productQuantity, setProductQuantity] = useState('');
  const [productUnit, setProductUnit] = useState<'kg' | 'g' | 'pieces' | 'bundle' | 'liter' | 'ml'>('kg');

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      farmerId: user?.id || '',
      name: productName,
      description: productDescription,
      price: parseFloat(productPrice),
      images: productImages,
      category: productCategory as ProductCategory,
      quantity: parseInt(productQuantity),
      unit: productUnit as 'kg' | 'g' | 'pieces' | 'bundle' | 'liter' | 'ml'
    };

    try {
      await createProduct(productData);
      toast({
        title: "Product created",
        description: `Your product ${productName} has been created successfully`,
      });
      
      // Reset form
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductImages([]);
      setProductQuantity('');
      
      if (onProductCreated) {
        onProductCreated();
      }
    } catch (error) {
      toast({
        title: "Error creating product",
        description: `Something went wrong. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleAddProduct} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
            type="text"
            placeholder="Enter product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IndianRupee className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
              type="number"
              placeholder="Enter price"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <div className="flex">
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
              type="number"
              placeholder="Enter quantity"
              value={productQuantity}
              onChange={(e) => setProductQuantity(e.target.value)}
              required
            />
            <select
              className="px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
              value={productUnit}
              onChange={(e) => setProductUnit(e.target.value as 'kg' | 'g' | 'pieces' | 'bundle' | 'liter' | 'ml')}
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="pieces">Pieces</option>
              <option value="bundle">Bundle</option>
              <option value="liter">Liter</option>
              <option value="ml">ml</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value as ProductCategory)}
          >
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="dairy">Dairy</option>
            <option value="grains">Grains</option>
            <option value="nuts">Nuts</option>
            <option value="spices">Spices</option>
            <option value="herbs">Herbs</option>
            <option value="honey">Honey</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
          rows={4}
          placeholder="Enter product description"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          required
        />
      </div>

      <ImageUpload 
        images={productImages}
        setImages={setProductImages}
        label="Product Images"
      />

      <button
        type="submit"
        className="w-full bg-farmsoc-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-farmsoc-primary/90 transition-colors"
      >
        Add Product
      </button>
    </form>
  );
};

export default ProductForm; 