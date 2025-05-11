
import React, { useState } from 'react';
import { User, Settings, LogOut, DollarSign, AtSign, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { SocialLink } from '../../types/user';

const InfluencerProfile: React.FC = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<'profile' | 'payouts'>('profile');
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
  
  // Mock payout history
  const payouts = [
    {
      id: 'p1',
      date: new Date('2023-07-20'),
      amount: 4500,
      status: 'completed',
      source: 'Green Meadows Farm - Tomato Campaign'
    },
    {
      id: 'p2',
      date: new Date('2023-07-05'),
      amount: 3200,
      status: 'completed',
      source: 'Honey Haven - Product Promotion'
    },
    {
      id: 'p3',
      date: new Date('2023-06-15'),
      amount: 5800,
      status: 'completed',
      source: 'Sunrise Grains - Recipe Series'
    }
  ];

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
            <p className="text-gray-500">Influencer</p>
            {user?.location && (
              <p className="text-gray-500 text-sm">{user.location}</p>
            )}
          </div>
        </div>
        
        {/* Section tabs */}
        <div className="flex border-b mt-4">
          <button
            className={`pb-2 px-4 flex items-center ${
              activeSection === 'profile' 
              ? 'text-kisanly-primary border-b-2 border-kisanly-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveSection('profile')}
          >
            <User size={18} className="mr-1" />
            Profile
          </button>
          <button
            className={`pb-2 px-4 flex items-center ${
              activeSection === 'payouts' 
              ? 'text-kisanly-primary border-b-2 border-kisanly-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveSection('payouts')}
          >
            <DollarSign size={18} className="mr-1" />
            Payouts
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
                className="text-kisanly-primary flex items-center"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary h-24"
                  placeholder="Tell farmers and consumers about yourself and your content..."
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
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
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
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
                    className="w-1/3 px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="other">Other</option>
                  </select>
                  
                  <input
                    type="text"
                    name="username"
                    value={newSocialLink.username}
                    onChange={handleSocialLinkChange}
                    placeholder="Username (without @)"
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
                  />
                  
                  <button 
                    type="button"
                    className="px-3 py-2 bg-kisanly-primary text-white rounded"
                    onClick={handleAddSocialLink}
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {/* Bank Account Details */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Payout Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      name="accountName"
                      value={bankDetails.accountName}
                      onChange={handleBankDetailsChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
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
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
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
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
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
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
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
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
                      placeholder="yourname@upi"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  className="px-4 py-2 bg-kisanly-primary text-white rounded"
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Payouts section */}
        {activeSection === 'payouts' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Payout Summary</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="text-gray-500 text-sm">Available Balance</div>
                  <div className="text-2xl font-bold">₹6,200</div>
                  <button className="mt-2 px-3 py-1 bg-kisanly-primary text-white text-sm rounded">
                    Withdraw
                  </button>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="text-gray-500 text-sm">Lifetime Earnings</div>
                  <div className="text-2xl font-bold">₹19,700</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between mb-4">
                <h2 className="text-lg font-semibold">Payout History</h2>
                <button className="text-kisanly-primary text-sm">View All</button>
              </div>
              
              {payouts.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-gray-500">No payout history yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payouts.map(payout => (
                    <div key={payout.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{payout.source}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(payout.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="font-bold">₹{payout.amount}</div>
                          <div className={`text-xs px-2 py-0.5 rounded-full ${
                            payout.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Payout Settings</h2>
              
              <div className="border rounded-lg divide-y">
                <div className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <CreditCard className="text-gray-400 mr-3" size={20} />
                    <div>
                      <div className="font-medium">Bank Account</div>
                      <div className="text-sm text-gray-500">
                        {bankDetails.accountName ? 
                          `${bankDetails.bankName} - XXXX${bankDetails.accountNumber.slice(-4)}` : 
                          'Not added'
                        }
                      </div>
                    </div>
                  </div>
                  <button className="text-kisanly-primary text-sm">
                    {bankDetails.accountName ? 'Edit' : 'Add'}
                  </button>
                </div>
                
                <div className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <AtSign className="text-gray-400 mr-3" size={20} />
                    <div>
                      <div className="font-medium">UPI</div>
                      <div className="text-sm text-gray-500">
                        {bankDetails.upiId || 'Not added'}
                      </div>
                    </div>
                  </div>
                  <button className="text-kisanly-primary text-sm">
                    {bankDetails.upiId ? 'Edit' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerProfile;
