
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from '../../components/common/PostCard';
import { getProducts } from '../../services/apiService';

const InfluencerHome: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch posts
  const { data: posts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts
  });
  
  // Fetch products for linked items
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });
  
  // Get linked product for each post
  const getLinkedProduct = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  return (
    <div className="h-full bg-gray-50 pb-16">
      {/* Greeting */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold mb-3">
          Hello, {user?.name?.split(' ')[0] || 'Influencer'}!
        </h1>
        <p className="text-gray-500">
          Stay updated with the latest from your network.
        </p>
      </div>
      
      <div className="p-4">
        {/* Feed section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Your Feed</h2>
          </div>
          
          {isPostsLoading ? (
            <div className="text-center p-8">
              <div className="w-10 h-10 border-4 border-farmsoc-light border-t-farmsoc-primary rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No posts to show.</p>
              <p className="text-gray-500 text-sm mt-1">Follow farmers to see their posts here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => {
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

export default InfluencerHome;
