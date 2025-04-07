
import React, { useState } from 'react';
import { User, Settings, LogOut, LineChart, CreditCard, Truck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getFarmerOrders, getFarmerProducts } from '../../services/apiService';
import { SocialLink } from '../../types/user';

const FarmerProfile: React.FC = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<'profile' | 'dashboard' | 'payments' | 'orders'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phoneNumber: user?.phoneNumber || ''
  });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    user?.socialLinks || []
  );
  const [newSocialLink, setNewSocialLink] = useState<SocialLink>({
    platform: 'instagram',
    username: ''
  });
  const [bankDetails, setBankDetails] = useState({
    accountName: user?.bankDetails?.accountName || '',
    accountNumber: user?.bankDetails?.accountNumber || '',
    bankName: user?.bankDetails?.bankName || '',
    ifscCode: user?.bankDetails?.ifscCode || '',
    upiId: user?.bankDetails?.upiId || ''
  });
  
  // Get products
  const { data: products = [] } = useQuery({
    queryKey: ['farmerProducts', user?.id],
    queryFn: () => getFarmerProducts(user?.id || ''),
    enabled: !!user && activeSection === 'dashboard'
  });
  
  // Get orders
  const { data: orders = [] } = useQuery({
    queryKey: ['farmerOrders', user?.id],
    queryFn: () => getFarmerOrders(user?.id || ''),
    enabled: !!user && (activeSection === 'dashboard' || activeSection === 'orders')
  });
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/app/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSocialLink(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddSocialLink = () => {
    if (!newSocialLink.username) {
      toast({
        title: "Validation error",
        description: "Please enter a username for the social platform",
        variant: "destructive"
      });
      return;
    }
    
    const updatedLinks = [...socialLinks, newSocialLink];
    setSocialLinks(updatedLinks);
    setNewSocialLink({
      platform: 'instagram',
      username: ''
    });
  };
  
  const handleRemoveSocialLink = (index: number) => {
    const updatedLinks = socialLinks.filter((_, i) => i !== index);
    setSocialLinks(updatedLinks);
  };
  
  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({
        ...user,
        name: profileData.name,
        bio: profileData.bio,
        location: profileData.location,
        phoneNumber: profileData.phoneNumber,
        socialLinks,
        bankDetails: {
          accountName: bankDetails.accountName,
          accountNumber: bankDetails.accountNumber,
          bankName: bankDetails.bankName,
          ifscCode: bankDetails.ifscCode,
          upiId: bankDetails.upiId
        }
      });
      
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated"
      });
    } catch (error) {
      console.error('Update profile error:', error);
      toast({
        title: "Update failed",
        description: "Could not update profile. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Calculate dashboard metrics
  const pendingOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'confirmed'
  ).length;
  
  const totalRevenue = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => {
      // Only include items from this farmer
      const farmerItems = order.items.filter(item => item.farmerId === user?.id);
      return sum + farmerItems.reduce((itemSum, item) => itemSum + item.totalPrice, 0);
    }, 0);
  
  const lowStockProducts = products.filter(product => product.quantity < 10).length;

  return (
    <div className="h-full bg-gray-50 pb-16">
      {/* Profile header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center">
          <img 
            src={user?.profileImage || 'https://via.placeholder.com/80'} 
            alt={user?.name} 
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="ml-4">
            <h1 className="text-xl font-semibold">{user?.name}</h1>
            <p className="text-gray-500">Farmer</p>
            {user?.location && (
              <p className="text-gray-500 text-sm">{user.location}</p>
            )}
          </div>
        </div>
        
        {/* Section tabs */}
        <div className="flex border-b mt-4 overflow-x-auto">
          <button
            className={`pb-2 px-4 flex items-center whitespace-nowrap ${
              activeSection === 'profile' 
              ? 'text-farmsoc-primary border-b-2 border-farmsoc-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveSection('profile')}
          >
            <User size={18} className="mr-1" />
            Profile
          </button>
          <button
            className={`pb-2 px-4 flex items-center whitespace-nowrap ${
              activeSection === 'dashboard' 
              ? 'text-farmsoc-primary border-b-2 border-farmsoc-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveSection('dashboard')}
          >
            <LineChart size={18} className="mr-1" />
            Dashboard
          </button>
          <button
            className={`pb-2 px-4 flex items-center whitespace-nowrap ${
              activeSection === 'payments' 
              ? 'text-farmsoc-primary border-b-2 border-farmsoc-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveSection('payments')}
          >
            <CreditCard size={18} className="mr-1" />
            Payment Settings
          </button>
          <button
            className={`pb-2 px-4 flex items-center whitespace-nowrap ${
              activeSection === 'orders' 
              ? 'text-farmsoc-primary border-b-2 border-farmsoc-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveSection('orders')}
          >
            <Truck size={18} className="mr-1" />
            Orders
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Profile section */}
        {activeSection === 'profile' && !isEditing && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Profile Information</h2>
              <button 
                className="text-farmsoc-primary flex items-center"
                onClick={() => setIsEditing(true)}
              >
                <Settings size={16} className="mr-1" />
                Edit
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500">Full Name</h3>
                <p>{user?.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm text-gray-500">Email</h3>
                <p>{user?.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm text-gray-500">Bio</h3>
                <p>{user?.bio || 'No bio provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm text-gray-500">Location</h3>
                <p>{user?.location || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm text-gray-500">Phone Number</h3>
                <p>{user?.phoneNumber || 'Not provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm text-gray-500">Social Media</h3>
                {user?.socialLinks && user.socialLinks.length > 0 ? (
                  <div className="space-y-2 mt-1">
                    {user.socialLinks.map((link, index) => (
                      <div key={index} className="flex items-center">
                        <span className="capitalize mr-2">{link.platform}:</span>
                        <span className="text-blue-600">@{link.username}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No social media accounts linked</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <button 
                className="text-red-500 flex items-center"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-1" />
                Log Out
              </button>
            </div>
          </div>
        )}
        
        {/* Edit Profile Form */}
        {activeSection === 'profile' && isEditing && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Profile</h2>
              <button 
                className="text-gray-500"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  className="w-full px-3 py-2 border rounded bg-gray-50"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary h-24"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                />
              </div>
              
              {/* Social Media Links */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Social Media Accounts
                </label>
                
                {socialLinks.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {socialLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="capitalize font-medium">{link.platform}: </span>
                          <span>@{link.username}</span>
                        </div>
                        <button 
                          className="text-red-500 text-sm"
                          onClick={() => handleRemoveSocialLink(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex space-x-2 mt-2">
                  <select
                    name="platform"
                    value={newSocialLink.platform}
                    onChange={handleSocialLinkChange}
                    className="w-1/3 px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="other">Other</option>
                  </select>
                  
                  <input
                    type="text"
                    name="username"
                    value={newSocialLink.username}
                    onChange={handleSocialLinkChange}
                    placeholder="Username (without @)"
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                  />
                  
                  <button 
                    type="button"
                    className="px-3 py-2 bg-farmsoc-primary text-white rounded"
                    onClick={handleAddSocialLink}
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  className="px-4 py-2 bg-farmsoc-primary text-white rounded"
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Dashboard section */}
        {activeSection === 'dashboard' && (
          <div className="space-y-4">
            {/* Dashboard metrics */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Dashboard</h2>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 border rounded-lg">
                  <div className="text-gray-500 text-sm">Pending Orders</div>
                  <div className="text-2xl font-bold">{pendingOrders}</div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="text-gray-500 text-sm">Total Revenue</div>
                  <div className="text-2xl font-bold">₹{totalRevenue}</div>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="text-gray-500 text-sm">Low Stock Items</div>
                  <div className="text-2xl font-bold">{lowStockProducts}</div>
                </div>
              </div>
            </div>
            
            {/* Recent orders */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Recent Orders</h2>
              
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 3).map(order => (
                    <div key={order.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between mb-1">
                        <div className="font-medium">Order #{order.id}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      
                      <div>
                        {order.items
                          .filter(item => item.farmerId === user?.id)
                          .map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.quantity}x {item.productName}
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                className="w-full mt-3 py-2 border border-farmsoc-primary text-farmsoc-primary rounded-lg"
                onClick={() => setActiveSection('orders')}
              >
                View All Orders
              </button>
            </div>
            
            {/* Analytics/Leads */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Customer Leads</h2>
              
              <p className="text-gray-500 text-center py-4">
                This feature will show consumer activity and potential leads for follow-up.
              </p>
            </div>
          </div>
        )}
        
        {/* Payment settings section */}
        {activeSection === 'payments' && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Payment Settings</h2>
            
            <form>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={bankDetails.accountName}
                    onChange={handleBankDetailsChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={bankDetails.bankName}
                    onChange={handleBankDetailsChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={bankDetails.accountNumber}
                      onChange={handleBankDetailsChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={bankDetails.ifscCode}
                      onChange={handleBankDetailsChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    name="upiId"
                    value={bankDetails.upiId}
                    onChange={handleBankDetailsChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                    placeholder="yourname@upi"
                  />
                </div>
                
                <button 
                  type="button"
                  className="px-4 py-2 bg-farmsoc-primary text-white rounded"
                  onClick={handleSaveProfile}
                >
                  Save Payment Settings
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Orders section */}
        {activeSection === 'orders' && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Your Orders</h2>
            
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">Order #{order.id}</div>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-3">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      {order.items
                        .filter(item => item.farmerId === user?.id)
                        .map((item, index) => (
                          <div key={index} className="flex justify-between py-1 border-b last:border-b-0">
                            <div>
                              <div>{item.productName}</div>
                              <div className="text-sm text-gray-500">
                                {item.quantity} x ₹{item.unitPrice}
                              </div>
                            </div>
                            <div className="font-medium">₹{item.totalPrice}</div>
                          </div>
                        ))
                      }
                    </div>
                    
                    <div className="pt-2 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="font-medium">Delivery:</span> {order.deliveryDate ? 
                          new Date(order.deliveryDate).toLocaleDateString() : 
                          'Not scheduled'
                        }
                      </div>
                      
                      {order.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-farmsoc-primary text-white text-sm rounded">
                            Accept
                          </button>
                          <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded">
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <button className="px-3 py-1 bg-green-600 text-white text-sm rounded">
                          Mark as Shipped
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerProfile;
