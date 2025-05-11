import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPosts, getProducts, getPersonalizedRecommendations } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from '../../components/common/PostCard';
import ProductCard from '../../components/common/ProductCard';

const ConsumerHome: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'recommendations'>('feed');
  
  // Fetch posts
  const { 
    data: posts = [], 
    isLoading: isPostsLoading 
  } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts
  });
  
  // Fetch recommended products
  const { 
    data: recommendedProducts = [], 
    isLoading: isRecommendationsLoading 
  } = useQuery({
    queryKey: ['recommendedProducts', user?.id],
    queryFn: () => getPersonalizedRecommendations(user?.id || ''),
    enabled: !!user
  });
  
  // Get linked products for posts
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });
  
  const getLinkedProduct = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Greeting and tabs */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold mb-3">
          Hello, {user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <div className="flex border-b">
          <button
            className={`pb-2 px-4 ${
              activeTab === 'feed' 
              ? 'text-kisanly-primary border-b-2 border-kisanly-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('feed')}
          >
            Feed
          </button>
          <button
            className={`pb-2 px-4 ${
              activeTab === 'recommendations' 
              ? 'text-kisanly-primary border-b-2 border-kisanly-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('recommendations')}
          >
            For You
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {activeTab === 'feed' ? (
          <>
            {isPostsLoading ? (
              <div className="text-center p-8">
                <div className="w-10 h-10 border-4 border-kisanly-light border-t-kisanly-primary rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-lg shadow">
                <p className="text-gray-500">No posts to show.</p>
                <p className="text-gray-500 text-sm mt-1">Follow farmers and influencers to see their posts here!</p>
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
          </>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-medium mb-2">Recommended for you</h2>
              {isRecommendationsLoading ? (
                <div className="text-center p-8">
                  <div className="w-10 h-10 border-4 border-kisanly-light border-t-kisanly-primary rounded-full animate-spin mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading recommendations...</p>
                </div>
              ) : recommendedProducts.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-lg shadow">
                  <p className="text-gray-500">No recommendations yet.</p>
                  <p className="text-gray-500 text-sm mt-1">As you browse and interact with products, we'll show you personalized recommendations.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {recommendedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-2">Based on your family preferences</h2>
              {user?.familyMembers && user.familyMembers.length > 0 ? (
                <div className="space-y-4">
                  {user.familyMembers.map(member => (
                    <div key={member.id} className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-medium">For {member.name}</h3>
                      {/* This would show personalized products for each family member */}
                      <p className="text-sm text-gray-500 mt-1">
                        Personalized nutrition recommendations based on {member.relationship} preferences.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-white rounded-lg shadow">
                  <p className="text-gray-500">No family members added yet.</p>
                  <p className="text-gray-500 text-sm mt-1">Add family members in your profile to get personalized recommendations for them.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConsumerHome;
