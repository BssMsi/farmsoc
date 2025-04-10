import React, { useState, useEffect } from 'react';
import { Video, MapPin } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { createPost } from '../../../services/apiService';
import { PostType } from '../../../types/post';
import { useToast } from '@/hooks/use-toast';
import { getFarmerProducts } from '../../../services/apiService';
import { Product } from '../../../types/product';
import ImageUpload from './shared/ImageUpload';

interface PostFormProps {
  onPostCreated?: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [postType, setPostType] = useState<PostType>('text' as PostType);
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postVideo, setPostVideo] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [postLocation, setPostLocation] = useState('');
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([]);

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
      type: postType as PostType,
      content: postContent,
      images: postImages,
      video: postVideo,
      linkedProducts: [selectedProductId],
      location: postLocation
    };

    try {
      await createPost(postData);
      toast({
        title: "Post created",
        description: `Your post has been created successfully`,
      });
      
      // Reset form
      setPostContent('');
      setPostImages([]);
      setPostVideo('');
      setSelectedProductId('');
      setPostLocation('');
      
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

  return (
    <form onSubmit={handleAddPost} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Product
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
              {product.name} - {new Date(product.createdAt).toLocaleDateString()}
            </option>
          ))}
        </select>
        {farmerProducts.length === 0 && (
          <p className="mt-1 text-sm text-red-600">
            You need to add a product first before creating a post
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Post Type
        </label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
          value={postType}
          onChange={(e) => setPostType(e.target.value as PostType)}
        >
          <option value="post">Post</option>
          <option value="reel">Reel</option>
          <option value="story">Story</option>
        </select>
      </div>

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
        images={postImages}
        setImages={setPostImages}
        label="Post Images"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Video className="h-5 w-5 text-gray-400" />
          </div>
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
            type="text"
            placeholder="Enter video URL"
            value={postVideo}
            onChange={(e) => setPostVideo(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
            type="text"
            placeholder="Enter location"
            value={postLocation}
            onChange={(e) => setPostLocation(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-farmsoc-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-farmsoc-primary/90 transition-colors"
      >
        Add Post
      </button>
    </form>
  );
};

export default PostForm; 