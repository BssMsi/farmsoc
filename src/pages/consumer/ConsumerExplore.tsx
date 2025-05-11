
import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchProducts, searchFarmers, getProducts } from '../../services/apiService';
import ProductCard from '../../components/common/ProductCard';
import { Product } from '../../types/product';
import { User } from '../../types/user';

const ConsumerExplore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'products' | 'farmers' | 'fundraisers'>('products');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    products: Product[];
    farmers: User[];
  }>({
    products: [],
    farmers: []
  });
  
  // Get all products for initial display and categories
  const { data: allProducts = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });
  
  // Get unique categories
  const categories = Array.from(new Set(allProducts.map(product => product.category)));
  
  const handleSearch = async () => {
    if (!searchQuery.trim() && searchType === 'products') {
      setSearchResults({...searchResults, products: allProducts});
      return;
    }
    
    setIsSearching(true);
    
    try {
      if (searchType === 'products') {
        const products = await searchProducts(searchQuery);
        setSearchResults({...searchResults, products});
      } else if (searchType === 'farmers') {
        const farmers = await searchFarmers(searchQuery);
        setSearchResults({...searchResults, farmers});
      }
      // 'fundraisers' search would go here
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  useEffect(() => {
    // Initialize with all products
    if (allProducts.length > 0 && searchResults.products.length === 0) {
      setSearchResults({...searchResults, products: allProducts});
    }
  }, [allProducts]);
  
  useEffect(() => {
    // Debounced search
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType]);

  return (
    <div className="h-full bg-gray-50 pb-16">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Explore</h1>
        
        {/* Search bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder={`Search for ${searchType}...`}
            className="w-full bg-gray-100 border-0 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-kisanly-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>
        
        {/* Search type tabs */}
        <div className="flex border-b">
          <button
            className={`pb-2 px-4 ${
              searchType === 'products' 
              ? 'text-kisanly-primary border-b-2 border-kisanly-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setSearchType('products')}
          >
            Products
          </button>
          <button
            className={`pb-2 px-4 ${
              searchType === 'farmers' 
              ? 'text-kisanly-primary border-b-2 border-kisanly-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setSearchType('farmers')}
          >
            Farmers
          </button>
          <button
            className={`pb-2 px-4 ${
              searchType === 'fundraisers' 
              ? 'text-kisanly-primary border-b-2 border-kisanly-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setSearchType('fundraisers')}
          >
            Fundraisers
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {isSearching || isProductsLoading ? (
          <div className="text-center p-8">
            <div className="w-10 h-10 border-4 border-kisanly-light border-t-kisanly-primary rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading...</p>
          </div>
        ) : (
          <>
            {searchType === 'products' && (
              <>
                {/* Category chips */}
                {categories.length > 0 && (
                  <div className="mb-4 overflow-x-auto flex pb-2">
                    <button
                      className="px-3 py-1 bg-kisanly-primary text-white rounded-full mr-2 whitespace-nowrap text-sm"
                      onClick={() => setSearchResults({...searchResults, products: allProducts})}
                    >
                      All
                    </button>
                    {categories.map(category => (
                      <button
                        key={category}
                        className="px-3 py-1 bg-white text-gray-700 border rounded-full mr-2 whitespace-nowrap text-sm"
                        onClick={() => {
                          const filtered = allProducts.filter(p => p.category === category);
                          setSearchResults({...searchResults, products: filtered});
                        }}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Products grid */}
                {searchResults.products.length === 0 ? (
                  <div className="text-center p-8 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No products found.</p>
                    <p className="text-sm text-gray-500 mt-1">Try a different search term or browse categories.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {searchResults.products.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}
            
            {searchType === 'farmers' && (
              <>
                {searchResults.farmers.length === 0 ? (
                  <div className="text-center p-8 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No farmers found.</p>
                    <p className="text-sm text-gray-500 mt-1">Try a different search term.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.farmers.map(farmer => (
                      <div key={farmer.id} className="bg-white p-4 rounded-lg shadow flex items-center">
                        <img 
                          src={farmer.profileImage || 'https://via.placeholder.com/60'} 
                          alt={farmer.name} 
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium">{farmer.name}</h3>
                          {farmer.location && (
                            <p className="text-gray-500 text-sm">{farmer.location}</p>
                          )}
                          {farmer.bio && (
                            <p className="text-gray-700 text-sm mt-1 line-clamp-2">{farmer.bio}</p>
                          )}
                        </div>
                        <button className="px-4 py-2 bg-kisanly-primary text-white rounded-lg text-sm">
                          Follow
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            
            {searchType === 'fundraisers' && (
              <div className="text-center p-8 bg-white rounded-lg shadow">
                <p className="text-gray-500">Fundraisers coming soon.</p>
                <p className="text-sm text-gray-500 mt-1">Check back later for updates.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConsumerExplore;
