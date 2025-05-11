
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFarmerProducts, getPosts } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from '../../components/common/PostCard';
import ProductCard from '../../components/common/ProductCard';
import { BarChart4, ShoppingCart, TrendingUp } from 'lucide-react';

const FarmerHome: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch posts and products
  const { data: posts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts
  });
  
  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['farmerProducts', user?.id],
    queryFn: () => getFarmerProducts(user?.id || ''),
    enabled: !!user
  });
  
  // Filter for posts by this farmer
  const myPosts = posts.filter(post => post.userId === user?.id);
  
  // Get linked product for each post
  const getLinkedProduct = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  return (
    <div className="h-full bg-gray-50 pb-16">
      {/* Greeting and quick stats */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold mb-3">
          Hello, {user?.name?.split(' ')[0] || 'Farmer'}!
        </h1>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-kisanly-light p-3 rounded-lg">
            <div className="flex items-center text-kisanly-dark">
              <ShoppingCart size={18} className="mr-2" />
              <span className="font-medium">Orders</span>
            </div>
            <div className="mt-1 text-2xl font-bold">3</div>
          </div>
          
          <div className="bg-kisanly-light p-3 rounded-lg">
            <div className="flex items-center text-kisanly-dark">
              <BarChart4 size={18} className="mr-2" />
              <span className="font-medium">Products</span>
            </div>
            <div className="mt-1 text-2xl font-bold">{products.length}</div>
          </div>
          
          <div className="bg-kisanly-light p-3 rounded-lg">
            <div className="flex items-center text-kisanly-dark">
              <TrendingUp size={18} className="mr-2" />
              <span className="font-medium">Views</span>
            </div>
            <div className="mt-1 text-2xl font-bold">132</div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* My Products section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">My Products</h2>
            <button 
              className="text-kisanly-primary text-sm font-medium"
              onClick={() => {/* View all products */}}
            >
              View All
            </button>
          </div>
          
          {isProductsLoading ? (
            <div className="text-center p-4">
              <div className="w-8 h-8 border-4 border-kisanly-light border-t-kisanly-primary rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-gray-500">You haven't added any products yet.</p>
              <button 
                className="mt-2 px-4 py-2 bg-kisanly-primary text-white rounded-lg text-sm"
                onClick={() => {/* Navigate to add product */}}
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
        
        {/* Feed section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">My Posts</h2>
          </div>
          
          {isPostsLoading ? (
            <div className="text-center p-4">
              <div className="w-8 h-8 border-4 border-kisanly-light border-t-kisanly-primary rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading posts...</p>
            </div>
          ) : myPosts.length === 0 ? (
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-gray-500">You haven't created any posts yet.</p>
              <button 
                className="mt-2 px-4 py-2 bg-kisanly-primary text-white rounded-lg text-sm"
                onClick={() => {/* Navigate to create post */}}
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myPosts.map(post => {
                // Get the first linked product
                const linkedProductId = post.linkedProducts && post.linkedProducts.length > 0 
                  ? post.linkedProducts[0] 
                  : undefined;
                
                const linkedProduct = linkedProductId 
                  ? getLinkedProduct(linkedProductId) 
                  : undefined;
                
                return (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    linkedProduct={linkedProduct}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerHome;
