import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createProduct, createPost } from '../../services/apiService';
import { Product, ProductCategory } from '../../types/product';
import { Post, PostType } from '../../types/post';
import { useToast } from '@/hooks/use-toast';

const FarmerAddContent: React.FC = () => {
  const { user } = useAuth();
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [productCategory, setProductCategory] = useState<ProductCategory>('vegetables');
  const [productQuantity, setProductQuantity] = useState('');
  const [productUnit, setProductUnit] = useState('kg');
  const [productTags, setProductTags] = useState('');
  const [postType, setPostType] = useState<PostType>('post');
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postVideo, setPostVideo] = useState('');
  const [linkedProductIds, setLinkedProductIds] = useState<string[]>([]);
  const [postLocation, setPostLocation] = useState('');
  const [postTags, setPostTags] = useState('');
  const { toast } = useToast();

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
      unit: productUnit as 'kg' | 'g' | 'pieces' | 'bundle' | 'liter' | 'ml',
      tags: productTags.split(',').map(tag => tag.trim()),
    };

    try {
      await createProduct(productData);
      toast({
        title: "Product created",
        description: `Your product ${productName} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error creating product",
        description: `Something went wrong. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();

    const postData = {
      userId: user?.id || '',
      username: user?.name || '',
      userRole: user?.role as 'farmer' | 'influencer',
      userProfileImage: user?.profileImage,
      type: postType as PostType,
      content: postContent,
      images: postImages,
      video: postVideo,
      linkedProducts: linkedProductIds,
      location: postLocation,
      tags: postTags.split(',').map(tag => tag.trim()),
    };

    try {
      await createPost(postData);
      toast({
        title: "Post created",
        description: `Your post has been created successfully`,
      });
    } catch (error) {
       toast({
        title: "Error creating post",
        description: `Something went wrong. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Add New Content</h1>

      {/* Add Product Form */}
      <form onSubmit={handleAddProduct} className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Add Product</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productName">
              Product Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="productName"
              type="text"
              placeholder="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productPrice">
              Price
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="productPrice"
              type="number"
              placeholder="Price"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productQuantity">
              Quantity
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="productQuantity"
              type="number"
              placeholder="Quantity"
              value={productQuantity}
              onChange={(e) => setProductQuantity(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productUnit">
              Unit
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="productUnit"
              value={productUnit}
              onChange={(e) => setProductUnit(e.target.value)}
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="pieces">Pieces</option>
              <option value="bundle">Bundle</option>
              <option value="liter">Liter</option>
              <option value="ml">ml</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productCategory">
              Category
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="productCategory"
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
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productTags">
              Tags (comma separated)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="productTags"
              type="text"
              placeholder="Tags"
              value={productTags}
              onChange={(e) => setProductTags(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productDescription">
            Description
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="productDescription"
            placeholder="Description"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Images
          </label>
          <div className="flex items-center">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Image URL"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.currentTarget as HTMLInputElement;
                  setProductImages([...productImages, input.value]);
                  input.value = ''; // Clear the input after adding
                }
              }}
            />
          </div>
          <div className="mt-2">
            {productImages.map((image, index) => (
              <div key={index} className="inline-flex items-center mr-2 mt-2 px-3 py-1 bg-gray-200 rounded-full text-sm text-gray-700">
                {image}
                <button type="button" className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none" onClick={() => setProductImages(productImages.filter((_, i) => i !== index))}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Add Product
        </button>
      </form>

      {/* Add Post Form */}
      <form onSubmit={handleAddPost} className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Add Post</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="postType">
            Post Type
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="postType"
            value={postType}
            onChange={(e) => setPostType(e.target.value as PostType)}
          >
            <option value="post">Post</option>
            <option value="reel">Reel</option>
            <option value="story">Story</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="postContent">
            Content
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="postContent"
            placeholder="Content"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Images
          </label>
          <div className="flex items-center">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Image URL"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.currentTarget as HTMLInputElement;
                  setPostImages([...postImages, input.value]);
                  input.value = ''; // Clear the input after adding
                }
              }}
            />
          </div>
          <div className="mt-2">
            {postImages.map((image, index) => (
              <div key={index} className="inline-flex items-center mr-2 mt-2 px-3 py-1 bg-gray-200 rounded-full text-sm text-gray-700">
                {image}
                <button type="button" className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none" onClick={() => setPostImages(postImages.filter((_, i) => i !== index))}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="postVideo">
            Video URL
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="postVideo"
            type="text"
            placeholder="Video URL"
            value={postVideo}
            onChange={(e) => setPostVideo(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="linkedProducts">
            Linked Product IDs (comma separated)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="linkedProducts"
            type="text"
            placeholder="Product IDs"
            value={linkedProductIds.join(',')}
            onChange={(e) => setLinkedProductIds(e.target.value.split(','))}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="postLocation">
            Location
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="postLocation"
            type="text"
            placeholder="Location"
            value={postLocation}
            onChange={(e) => setPostLocation(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="postTags">
            Tags (comma separated)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="postTags"
            type="text"
            placeholder="Tags"
            value={postTags}
            onChange={(e) => setPostTags(e.target.value)}
          />
        </div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Add Post
        </button>
      </form>
    </div>
  );
};

export default FarmerAddContent;
