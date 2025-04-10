import React, { useState } from 'react';
import { Plus, X, Image as ImageIcon, Video, MapPin, Tag, DollarSign, Calendar, Users, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createProduct, createPost } from '../../services/apiService';
import { Product, ProductCategory } from '../../types/product';
import { Post, PostType } from '../../types/post';
import { useToast } from '@/hooks/use-toast';

// Mock influencer data for search
const mockInfluencers = [
  {
    id: 'i1',
    name: 'Sarah Johnson',
    age: 28,
    location: 'Mumbai, India',
    totalFollowers: 125000,
    compensation: ['product', 'fixed'],
    profileImage: 'https://i.pravatar.cc/150?img=1',
    platforms: [
      {
        name: 'Instagram',
        followers: 85000,
        engagement: '5.2%',
        username: '@sarahj_farmlife'
      },
      {
        name: 'YouTube',
        followers: 40000,
        engagement: '4.1%',
        username: '@sarahs_farm_diaries'
      }
    ],
    averageEngagement: '4.7%'
  },
  {
    id: 'i2',
    name: 'Raj Patel',
    age: 32,
    location: 'Delhi, India',
    totalFollowers: 85000,
    compensation: ['commission', 'product'],
    profileImage: 'https://i.pravatar.cc/150?img=2',
    platforms: [
      {
        name: 'Instagram',
        followers: 45000,
        engagement: '3.8%',
        username: '@raj_farmerslife'
      },
      {
        name: 'TikTok',
        followers: 40000,
        engagement: '2.6%',
        username: '@raj_farming'
      }
    ],
    averageEngagement: '3.2%'
  },
  {
    id: 'i3',
    name: 'Priya Sharma',
    age: 25,
    location: 'Bangalore, India',
    totalFollowers: 150000,
    compensation: ['fixed', 'commission'],
    profileImage: 'https://i.pravatar.cc/150?img=3',
    platforms: [
      {
        name: 'YouTube',
        followers: 90000,
        engagement: '5.8%',
        username: '@priyas_farm_kitchen'
      },
      {
        name: 'Instagram',
        followers: 60000,
        engagement: '4.4%',
        username: '@priya_farmfresh'
      }
    ],
    averageEngagement: '5.1%'
  }
];

const FarmerAddContent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'product' | 'post' | 'collaboration'>('product');
  const [activeCollaborationTab, setActiveCollaborationTab] = useState<'search' | 'add'>('search');
  const [isCollaboration, setIsCollaboration] = useState(false);
  const [isInfluencerCollaboration, setIsInfluencerCollaboration] = useState(false);
  const [compensationType, setCompensationType] = useState<'monetary' | 'product'>('monetary');
  
  // Product states
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [productCategory, setProductCategory] = useState<ProductCategory>('vegetables');
  const [productQuantity, setProductQuantity] = useState('');
  const [productUnit, setProductUnit] = useState<'kg' | 'g' | 'pieces' | 'bundle' | 'liter' | 'ml'>('kg');
  const [productTags, setProductTags] = useState('');
  
  // Post states
  const [postType, setPostType] = useState<PostType>('text' as PostType);
  const [postContent, setPostContent] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postVideo, setPostVideo] = useState('');
  const [linkedProductIds, setLinkedProductIds] = useState<string[]>([]);
  const [postLocation, setPostLocation] = useState('');
  const [postTags, setPostTags] = useState('');
  
  // Collaboration states
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    minAge: '',
    maxAge: '',
    minCompensation: '',
    maxCompensation: '',
    minFollowers: '',
    maxFollowers: ''
  });

  // Collaboration form states
  const [collaborationBudget, setCollaborationBudget] = useState('');
  const [collaborationTimeline, setCollaborationTimeline] = useState('');
  const [collaborationRequirements, setCollaborationRequirements] = useState('');
  const [collaborationPlatforms, setCollaborationPlatforms] = useState<string[]>([]);
  const [collaborationFollowerCount, setCollaborationFollowerCount] = useState('');
  const [collaborationDeadline, setCollaborationDeadline] = useState('');
  const [productExchangeName, setProductExchangeName] = useState('');
  const [productExchangeQuantity, setProductExchangeQuantity] = useState('');

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
      tags: productTags.split(',').map(tag => tag.trim())
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
      setProductTags('');
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
      tags: postTags.split(',').map(tag => tag.trim())
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
      setLinkedProductIds([]);
      setPostLocation('');
      setPostTags('');
    } catch (error) {
      toast({
        title: "Error creating post",
        description: `Something went wrong. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleAddCollaboration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const collaborationData = {
      farmerId: user?.id || '',
      farmerName: user?.name || '',
      compensationType,
      ...(compensationType === 'monetary' 
        ? { budget: parseFloat(collaborationBudget) }
        : { 
            productName: productExchangeName,
            productQuantity: parseInt(productExchangeQuantity)
          }
      ),
      timeline: collaborationTimeline,
      requirements: collaborationRequirements,
      platforms: collaborationPlatforms,
      followerCount: parseInt(collaborationFollowerCount),
      deadline: new Date(collaborationDeadline),
      status: 'open',
      createdAt: new Date()
    };

    try {
      // TODO: Implement API call to create collaboration
      toast({
        title: "Collaboration created",
        description: "Your collaboration requirement has been posted successfully",
      });
      
      // Reset form
      setCollaborationBudget('');
      setCollaborationTimeline('');
      setCollaborationRequirements('');
      setCollaborationPlatforms([]);
      setCollaborationFollowerCount('');
      setCollaborationDeadline('');
      setProductExchangeName('');
      setProductExchangeQuantity('');
    } catch (error) {
      toast({
        title: "Error creating collaboration",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = () => {
    // TODO: Implement influencer search with filters
    console.log('Searching with filters:', {
      location: searchFilters.location,
      ageRange: `${searchFilters.minAge}-${searchFilters.maxAge}`,
      followerRange: `${searchFilters.minFollowers}-${searchFilters.maxFollowers}`,
      compensationRange: `${searchFilters.minCompensation}-${searchFilters.maxCompensation}`
    });
  };

  // Filter influencers based on search criteria
  const filteredInfluencers = mockInfluencers.filter(influencer => {
    if (searchFilters.location && !influencer.location.toLowerCase().includes(searchFilters.location.toLowerCase())) {
      return false;
    }
    if (searchFilters.minAge && influencer.age < parseInt(searchFilters.minAge)) {
      return false;
    }
    if (searchFilters.maxAge && influencer.age > parseInt(searchFilters.maxAge)) {
      return false;
    }
    if (searchFilters.minFollowers && influencer.totalFollowers < parseInt(searchFilters.minFollowers)) {
      return false;
    }
    if (searchFilters.maxFollowers && influencer.totalFollowers > parseInt(searchFilters.maxFollowers)) {
      return false;
    }
    if (searchFilters.minCompensation && !influencer.compensation.includes(searchFilters.minCompensation)) {
      return false;
    }
    if (searchFilters.maxCompensation && !influencer.compensation.includes(searchFilters.maxCompensation)) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Content</h1>
          <p className="text-gray-600">Create products, posts, or collaboration requirements</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4 bg-white p-2 rounded-lg shadow-md">
              <button
                className={`px-6 py-2 rounded-lg transition-colors ${
                  activeTab === 'product'
                    ? 'bg-farmsoc-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('product')}
              >
                Add Product
              </button>
              <button
                className={`px-6 py-2 rounded-lg transition-colors ${
                  activeTab === 'post'
                    ? 'bg-farmsoc-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('post')}
              >
                Create Post
              </button>
              <button
                className={`px-6 py-2 rounded-lg transition-colors ${
                  activeTab === 'collaboration'
                    ? 'bg-farmsoc-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('collaboration')}
              >
                Collaboration
              </button>
            </div>
          </div>

          {/* Product Form */}
          {activeTab === 'product' && (
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
                      <DollarSign className="h-5 w-5 text-gray-400" />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                    type="text"
                    placeholder="Enter image URL"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.currentTarget as HTMLInputElement;
                        if (input.value.trim()) {
                          setProductImages([...productImages, input.value.trim()]);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                      if (input.value.trim()) {
                        setProductImages([...productImages, input.value.trim()]);
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {productImages.map((image, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                    >
                      <span className="text-sm text-gray-600 truncate max-w-xs">{image}</span>
                      <button
                        type="button"
                        className="ml-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setProductImages(productImages.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                    type="text"
                    placeholder="Enter tags (comma separated)"
                    value={productTags}
                    onChange={(e) => setProductTags(e.target.value)}
                  />
                </div>
              </div>

              {/* Collaboration Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Influencer Requirement</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isInfluencerCollaboration}
                      onChange={(e) => setIsInfluencerCollaboration(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-farmsoc-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-farmsoc-primary"></div>
                  </label>
                </div>

                {isInfluencerCollaboration && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <form onSubmit={handleAddCollaboration} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Compensation Type
                          </label>
                          <div className="flex space-x-4">
                            <button
                              type="button"
                              onClick={() => setCompensationType('monetary')}
                              className={`flex-1 px-4 py-2 rounded-lg border ${
                                compensationType === 'monetary'
                                  ? 'bg-farmsoc-primary text-white border-farmsoc-primary'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Monetary Budget
                            </button>
                            <button
                              type="button"
                              onClick={() => setCompensationType('product')}
                              className={`flex-1 px-4 py-2 rounded-lg border ${
                                compensationType === 'product'
                                  ? 'bg-farmsoc-primary text-white border-farmsoc-primary'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Product Exchange
                            </button>
                          </div>
                        </div>

                        {compensationType === 'monetary' ? (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Budget (₹)
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                                type="number"
                                placeholder="Enter budget in INR"
                                value={collaborationBudget}
                                onChange={(e) => setCollaborationBudget(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name
                              </label>
                              <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                                type="text"
                                placeholder="Enter product name"
                                value={productExchangeName}
                                onChange={(e) => setProductExchangeName(e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity
                              </label>
                              <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                                type="number"
                                placeholder="Enter quantity"
                                value={productExchangeQuantity}
                                onChange={(e) => setProductExchangeQuantity(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Timeline
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                              type="text"
                              placeholder="e.g., 2 weeks, 1 month"
                              value={collaborationTimeline}
                              onChange={(e) => setCollaborationTimeline(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Follower Count
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Users className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                              type="number"
                              placeholder="Enter minimum follower count"
                              value={collaborationFollowerCount}
                              onChange={(e) => setCollaborationFollowerCount(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deadline
                          </label>
                          <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                            type="date"
                            value={collaborationDeadline}
                            onChange={(e) => setCollaborationDeadline(e.target.value)}
                            required
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Requirements
                          </label>
                          <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                            rows={3}
                            placeholder="Enter specific requirements for the collaboration"
                            value={collaborationRequirements}
                            onChange={(e) => setCollaborationRequirements(e.target.value)}
                            required
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred Platforms
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                              type="text"
                              placeholder="Enter platform (e.g., Instagram, YouTube)"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.currentTarget as HTMLInputElement;
                                  if (input.value.trim()) {
                                    setCollaborationPlatforms([...collaborationPlatforms, input.value.trim()]);
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="p-2 text-gray-500 hover:text-gray-700"
                              onClick={() => {
                                const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                                if (input.value.trim()) {
                                  setCollaborationPlatforms([...collaborationPlatforms, input.value.trim()]);
                                  input.value = '';
                                }
                              }}
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {collaborationPlatforms.map((platform, index) => (
                              <div
                                key={index}
                                className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                              >
                                <span className="text-sm text-gray-600">{platform}</span>
                                <button
                                  type="button"
                                  className="ml-2 text-gray-500 hover:text-gray-700"
                                  onClick={() => setCollaborationPlatforms(collaborationPlatforms.filter((_, i) => i !== index))}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-farmsoc-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-farmsoc-primary/90 transition-colors"
                      >
                        Post Collaboration Requirement
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* Post Form */}
          {activeTab === 'post' && (
            <form onSubmit={handleAddPost} className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                    type="text"
                    placeholder="Enter image URL"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.currentTarget as HTMLInputElement;
                        if (input.value.trim()) {
                          setPostImages([...postImages, input.value.trim()]);
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                      if (input.value.trim()) {
                        setPostImages([...postImages, input.value.trim()]);
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {postImages.map((image, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                    >
                      <span className="text-sm text-gray-600 truncate max-w-xs">{image}</span>
                      <button
                        type="button"
                        className="ml-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setPostImages(postImages.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                    type="text"
                    placeholder="Enter tags (comma separated)"
                    value={postTags}
                    onChange={(e) => setPostTags(e.target.value)}
                  />
                </div>
              </div>

              {/* Collaboration Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Influencer Requirement</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isInfluencerCollaboration}
                      onChange={(e) => setIsInfluencerCollaboration(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-farmsoc-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-farmsoc-primary"></div>
                  </label>
                </div>

                {isInfluencerCollaboration && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Budget
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                            type="number"
                            placeholder="Enter budget"
                            value={collaborationBudget}
                            onChange={(e) => setCollaborationBudget(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timeline
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                            type="text"
                            placeholder="e.g., 2 weeks, 1 month"
                            value={collaborationTimeline}
                            onChange={(e) => setCollaborationTimeline(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Follower Count
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Users className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                            type="number"
                            placeholder="Enter minimum follower count"
                            value={collaborationFollowerCount}
                            onChange={(e) => setCollaborationFollowerCount(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deadline
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                          type="date"
                          value={collaborationDeadline}
                          onChange={(e) => setCollaborationDeadline(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Requirements
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                        rows={3}
                        placeholder="Enter specific requirements for the collaboration"
                        value={collaborationRequirements}
                        onChange={(e) => setCollaborationRequirements(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Platforms
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                          type="text"
                          placeholder="Enter platform (e.g., Instagram, YouTube)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.currentTarget as HTMLInputElement;
                              if (input.value.trim()) {
                                setCollaborationPlatforms([...collaborationPlatforms, input.value.trim()]);
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="p-2 text-gray-500 hover:text-gray-700"
                          onClick={() => {
                            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                            if (input.value.trim()) {
                              setCollaborationPlatforms([...collaborationPlatforms, input.value.trim()]);
                              input.value = '';
                            }
                          }}
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {collaborationPlatforms.map((platform, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                          >
                            <span className="text-sm text-gray-600">{platform}</span>
                            <button
                              type="button"
                              className="ml-2 text-gray-500 hover:text-gray-700"
                              onClick={() => setCollaborationPlatforms(collaborationPlatforms.filter((_, i) => i !== index))}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-farmsoc-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-farmsoc-primary/90 transition-colors"
              >
                Add Post
              </button>
            </form>
          )}

          {/* Collaboration Tabs */}
          {activeTab === 'collaboration' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-center mb-6">
                <div className="flex space-x-4 bg-gray-100 p-2 rounded-lg">
                  <button
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      activeCollaborationTab === 'search'
                        ? 'bg-farmsoc-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveCollaborationTab('search')}
                  >
                    Search Influencers
                  </button>
                  <button
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      activeCollaborationTab === 'add'
                        ? 'bg-farmsoc-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveCollaborationTab('add')}
                  >
                    Add Requirement
                  </button>
                </div>
              </div>

              {activeCollaborationTab === 'search' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Search Filters</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          placeholder="Enter location"
                          value={searchFilters.location}
                          onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Age
                          </label>
                          <input
                            type="number"
                            placeholder="Min"
                            value={searchFilters.minAge}
                            onChange={(e) => setSearchFilters({ ...searchFilters, minAge: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Age
                          </label>
                          <input
                            type="number"
                            placeholder="Max"
                            value={searchFilters.maxAge}
                            onChange={(e) => setSearchFilters({ ...searchFilters, maxAge: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Followers
                          </label>
                          <input
                            type="number"
                            placeholder="Min"
                            value={searchFilters.minFollowers}
                            onChange={(e) => setSearchFilters({ ...searchFilters, minFollowers: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Followers
                          </label>
                          <input
                            type="number"
                            placeholder="Max"
                            value={searchFilters.maxFollowers}
                            onChange={(e) => setSearchFilters({ ...searchFilters, maxFollowers: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Compensation Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['product', 'fixed', 'commission'].map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                if (searchFilters.minCompensation === type) {
                                  setSearchFilters({ ...searchFilters, minCompensation: '' });
                                } else {
                                  setSearchFilters({ ...searchFilters, minCompensation: type });
                                }
                              }}
                              className={`px-3 py-1 rounded-full text-sm ${
                                searchFilters.minCompensation === type
                                  ? 'bg-farmsoc-primary text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={handleSearch}
                        className="w-full sm:w-auto px-6 py-2 bg-farmsoc-primary text-white rounded-lg hover:bg-farmsoc-primary/90 transition-colors"
                      >
                        Search Influencers
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredInfluencers.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No influencers found matching your criteria.</p>
                      </div>
                    ) : (
                      filteredInfluencers.map(influencer => (
                        <div key={influencer.id} className="bg-white rounded-lg shadow-sm p-4 mb-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-shrink-0">
                              <img
                                src={influencer.profileImage}
                                alt={influencer.name}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <div>
                                  <h3 className="font-medium text-gray-900 text-lg">{influencer.name}</h3>
                                  <p className="text-sm text-gray-500">{influencer.location}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{influencer.totalFollowers.toLocaleString()} total followers</p>
                                  <p className="text-sm text-gray-500">{influencer.averageEngagement} avg. engagement</p>
                                </div>
                              </div>
                              
                              <div className="mt-4 space-y-3">
                                {influencer.platforms.map(platform => (
                                  <div key={platform.name} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">{platform.name}</span>
                                        <span className="text-sm text-gray-500">{platform.username}</span>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium">{platform.followers.toLocaleString()} followers</p>
                                        <p className="text-sm text-gray-500">{platform.engagement} engagement</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {influencer.compensation.map(type => (
                                  <span
                                    key={type}
                                    className="px-2 py-1 bg-farmsoc-light text-farmsoc-dark rounded-full text-xs"
                                  >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </span>
                                ))}
                              </div>

                              <div className="mt-4 flex justify-end">
                                <button
                                  className="px-4 py-2 bg-farmsoc-primary text-white rounded-lg hover:bg-farmsoc-primary/90 transition-colors w-full sm:w-auto"
                                  onClick={() => {
                                    setActiveCollaborationTab('add');
                                    setCollaborationFollowerCount(influencer.totalFollowers.toString());
                                  }}
                                >
                                  Create Collaboration
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeCollaborationTab === 'add' && (
                <form onSubmit={handleAddCollaboration} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compensation Type
                      </label>
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={() => setCompensationType('monetary')}
                          className={`flex-1 px-4 py-2 rounded-lg border ${
                            compensationType === 'monetary'
                              ? 'bg-farmsoc-primary text-white border-farmsoc-primary'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Monetary Budget
                        </button>
                        <button
                          type="button"
                          onClick={() => setCompensationType('product')}
                          className={`flex-1 px-4 py-2 rounded-lg border ${
                            compensationType === 'product'
                              ? 'bg-farmsoc-primary text-white border-farmsoc-primary'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Product Exchange
                        </button>
                      </div>
                    </div>

                    {compensationType === 'monetary' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Budget (₹)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                            type="number"
                            placeholder="Enter budget in INR"
                            value={collaborationBudget}
                            onChange={(e) => setCollaborationBudget(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name
                          </label>
                          <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                            type="text"
                            placeholder="Enter product name"
                            value={productExchangeName}
                            onChange={(e) => setProductExchangeName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                            type="number"
                            placeholder="Enter quantity"
                            value={productExchangeQuantity}
                            onChange={(e) => setProductExchangeQuantity(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timeline
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                          type="text"
                          placeholder="e.g., 2 weeks, 1 month"
                          value={collaborationTimeline}
                          onChange={(e) => setCollaborationTimeline(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Follower Count
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                          type="number"
                          placeholder="Enter minimum follower count"
                          value={collaborationFollowerCount}
                          onChange={(e) => setCollaborationFollowerCount(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deadline
                      </label>
                      <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                        type="date"
                        value={collaborationDeadline}
                        onChange={(e) => setCollaborationDeadline(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Requirements
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                        rows={3}
                        placeholder="Enter specific requirements for the collaboration"
                        value={collaborationRequirements}
                        onChange={(e) => setCollaborationRequirements(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Platforms
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
                          type="text"
                          placeholder="Enter platform (e.g., Instagram, YouTube)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.currentTarget as HTMLInputElement;
                              if (input.value.trim()) {
                                setCollaborationPlatforms([...collaborationPlatforms, input.value.trim()]);
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="p-2 text-gray-500 hover:text-gray-700"
                          onClick={() => {
                            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                            if (input.value.trim()) {
                              setCollaborationPlatforms([...collaborationPlatforms, input.value.trim()]);
                              input.value = '';
                            }
                          }}
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {collaborationPlatforms.map((platform, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                          >
                            <span className="text-sm text-gray-600">{platform}</span>
                            <button
                              type="button"
                              className="ml-2 text-gray-500 hover:text-gray-700"
                              onClick={() => setCollaborationPlatforms(collaborationPlatforms.filter((_, i) => i !== index))}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-farmsoc-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-farmsoc-primary/90 transition-colors"
                  >
                    Post Collaboration Requirement
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerAddContent;
