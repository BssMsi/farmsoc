import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { createPost } from '../../../services/apiService';
import { useToast } from '@/hooks/use-toast';
import { getFarmerProducts } from '../../../services/apiService';
import { Product } from '../../../types/product';
import ImageUpload from './shared/ImageUpload';
import PostCard from '../../../components/common/PostCard';

interface PostFormProps {
  onPostCreated?: () => void;
  initialValues?: {
    content?: string;
    productId?: string;
  };
}

const PostForm: React.FC<PostFormProps> = ({ onPostCreated, initialValues = {} }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [postContent, setPostContent] = useState(initialValues.content || '');
  const [postMedia, setPostMedia] = useState<string[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(initialValues.productId || '');
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Update form fields when initialValues change
  useEffect(() => {
    if (initialValues.content !== undefined) setPostContent(initialValues.content);
    if (initialValues.productId !== undefined) setSelectedProductId(initialValues.productId);
  }, [initialValues]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getFarmerProducts(user?.id || '');
        const sortedProducts = products.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setFarmerProducts(sortedProducts);
      } catch (error) {
        toast({
          title: "Error fetching products",
          description: "Could not load your products. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (user?.id) {
      fetchProducts();
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (selectedProductId) {
      const product = farmerProducts.find(p => p.id === selectedProductId);
      setSelectedProduct(product || null);
    } else {
      setSelectedProduct(null);
    }
  }, [selectedProductId, farmerProducts]);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      toast({
        title: "Product required",
        description: "Please select a product for your post",
        variant: "destructive",
      });
      return;
    }

    const postData = {
      userId: user?.id || '',
      username: user?.name || '',
      userRole: user?.role as 'farmer' | 'influencer',
      userProfileImage: user?.profileImage,
      content: postContent,
      images: postMedia.filter(media => !media.startsWith('data:video')),
      video: postMedia.find(media => media.startsWith('data:video')) || '',
      linkedProducts: [selectedProductId]
    };

    try {
      await createPost(postData);
      toast({
        title: "Post created",
        description: `Your post has been created successfully`,
      });
      
      // Reset form
      setPostContent('');
      setPostMedia([]);
      setSelectedProductId('');
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      toast({
        title: "Error creating post",
        description: `Something went wrong. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Create a preview post object
  const previewPost = {
    id: 'preview',
    userId: user?.id || '',
    username: user?.name || '',
    userRole: user?.role as 'farmer' | 'influencer',
    userProfileImage: user?.profileImage,
    content: postContent,
    images: postMedia.filter(media => !media.startsWith('data:video')),
    video: postMedia.find(media => media.startsWith('data:video')) || '',
    linkedProducts: selectedProductId ? [selectedProductId] : [],
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: 0,
    comments: [],
    isLikedByCurrentUser: false
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddPost} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
            rows={4}
            placeholder="Write your post content"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            required
          />
        </div>

        <ImageUpload 
          images={postMedia}
          setImages={setPostMedia}
          label="Media"
          accept={{
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'video/*': ['.mp4', '.mov', '.avi']
          }}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
          >
            <option value="">Select a product</option>
            {farmerProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Preview
              </>
            )}
          </button>

          <button
            type="submit"
            className="bg-farmsoc-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-farmsoc-primary/90 transition-colors"
          >
            Create Post
          </button>
        </div>
      </form>

      {showPreview && (
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Post Preview</h3>
          <PostCard 
            post={previewPost} 
            linkedProduct={selectedProduct}
          />
        </div>
      )}
    </div>
  );
};

export default PostForm; 