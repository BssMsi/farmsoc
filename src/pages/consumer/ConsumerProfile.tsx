import React, { useState } from 'react';
import { User, Settings, LogOut, PlusCircle, Users, ShoppingBag, CreditCard, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../../services/apiService';
import { FamilyMember } from '../../types/user';

const ConsumerProfile: React.FC = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<'profile' | 'family' | 'orders' | 'payment'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phoneNumber: user?.phoneNumber || '',
    diseases: user?.diseases || []
  });
  const [isDiseasesOpen, setIsDiseasesOpen] = useState(false);
  const [newDisease, setNewDisease] = useState('');
  // Available diseases for selection
  const availableDiseases = [
    'Diabetes', 'Hypertension', 'Asthma', 'Arthritis', 
    'Heart Disease', 'Allergies', 'Celiac Disease', 
    'Lactose Intolerance', 'Thyroid Disorder'
  ];
  const [newFamilyMember, setNewFamilyMember] = useState<{
    name: string;
    relationship: string;
    age?: number;
  }>({
    name: '',
    relationship: 'spouse',
  });
  
  // Get orders
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => getOrders(user?.id || ''),
    enabled: !!user && activeSection === 'orders'
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
  
  const handleFamilyMemberInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewFamilyMember(prev => ({
      ...prev,
      [name]: name === 'age' ? (value ? parseInt(value) : undefined) : value
    }));
  };
  
  const handleDiseaseSelect = (disease: string) => {
    if (!profileData.diseases.includes(disease)) {
      setProfileData(prev => ({
        ...prev,
        diseases: [...prev.diseases, disease]
      }));
    }
    setIsDiseasesOpen(false);
  };

  const handleDiseaseRemove = (disease: string) => {
    setProfileData(prev => ({
      ...prev,
      diseases: prev.diseases.filter(d => d !== disease)
    }));
  };
  
  const handleNewDiseaseInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDisease(e.target.value);
  };

  const handleAddCustomDisease = () => {
    if (newDisease && !profileData.diseases.includes(newDisease)) {
      setProfileData(prev => ({
        ...prev,
        diseases: [...prev.diseases, newDisease]
      }));
      setNewDisease('');
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({
        ...user,
        name: profileData.name,
        bio: profileData.bio,
        location: profileData.location,
        phoneNumber: profileData.phoneNumber,
        diseases: profileData.diseases
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
  
  const handleAddFamilyMember = async () => {
    if (!newFamilyMember.name) {
      toast({
        title: "Validation error",
        description: "Please enter a name for the family member",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const updatedFamilyMembers: FamilyMember[] = [
        ...(user?.familyMembers || []),
        {
          id: `f${Date.now()}`,
          name: newFamilyMember.name,
          relationship: newFamilyMember.relationship,
          age: newFamilyMember.age
        }
      ];
      
      await updateUserProfile({
        ...user,
        familyMembers: updatedFamilyMembers
      });
      
      // Reset form
      setNewFamilyMember({
        name: '',
        relationship: 'spouse',
      });
      
      toast({
        title: "Family member added",
        description: `${newFamilyMember.name} has been added to your family`
      });
    } catch (error) {
      console.error('Add family member error:', error);
      toast({
        title: "Error",
        description: "Could not add family member. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveFamilyMember = async (memberId: string) => {
    try {
      const updatedFamilyMembers = user?.familyMembers?.filter(
        member => member.id !== memberId
      ) || [];
      
      await updateUserProfile({
        ...user,
        familyMembers: updatedFamilyMembers
      });
      
      toast({
        title: "Family member removed",
        description: "Family member has been removed"
      });
    } catch (error) {
      console.error('Remove family member error:', error);
      toast({
        title: "Error",
        description: "Could not remove family member. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-full bg-gray-50">
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
            <p className="text-gray-500">Consumer</p>
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
              ? 'text-farmsoc-primary border-b-2 border-farmsoc-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveSection('profile')}
          >
            <User size={18} className="mr-1" />
            Profile
          </button>
          <button
            className={`pb-2 px-4 flex items-center ${
              activeSection === 'family' 
              ? 'text-farmsoc-primary border-b-2 border-farmsoc-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveSection('family')}
          >
            <Users size={18} className="mr-1" />
            Family
          </button>
          <button
            className={`pb-2 px-4 flex items-center ${
              activeSection === 'orders' 
              ? 'text-farmsoc-primary border-b-2 border-farmsoc-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveSection('orders')}
          >
            <ShoppingBag size={18} className="mr-1" />
            Orders
          </button>
          <button
            className={`pb-2 px-4 flex items-center ${
              activeSection === 'payment' 
              ? 'text-farmsoc-primary border-b-2 border-farmsoc-primary font-medium' 
              : 'text-gray-500'
            }`}
            onClick={() => setActiveSection('payment')}
          >
            <CreditCard size={18} className="mr-1" />
            Payment
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Profile section */}
        {activeSection === 'profile' && (
          <div className="bg-white rounded-lg shadow p-4">
            {isEditing ? (
              <>
                <div className="mb-4">
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
                
                <div className="mb-4">
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
                
                <div className="mb-4">
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
                
                <div className="mb-4">
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
                
                <div className="mb-4">
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
                
                {/* Disease multi-select */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Health Conditions
                  </label>
                  
                  {/* Selected diseases chips */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileData.diseases.map(disease => (
                      <div key={disease} className="bg-farmsoc-light text-farmsoc-primary px-2 py-1 rounded-full flex items-center text-sm">
                        {disease}
                        <button 
                          onClick={() => handleDiseaseRemove(disease)}
                          className="ml-1 rounded-full hover:bg-red-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsDiseasesOpen(!isDiseasesOpen)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary text-left flex justify-between items-center"
                    >
                      <span>Select conditions</span>
                      <span className="text-gray-400">▼</span>
                    </button>
                    
                    {isDiseasesOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                        {availableDiseases.map(disease => (
                          <div 
                            key={disease}
                            className={`p-2 hover:bg-gray-100 cursor-pointer ${
                              profileData.diseases.includes(disease) ? 'bg-gray-100' : ''
                            }`}
                            onClick={() => handleDiseaseSelect(disease)}
                          >
                            {disease}
                          </div>
                        ))}
                        
                        {/* Custom disease input */}
                        <div className="p-2 border-t">
                          <div className="flex">
                            <input 
                              type="text"
                              value={newDisease}
                              onChange={handleNewDiseaseInput}
                              placeholder="Add custom condition"
                              className="flex-grow px-2 py-1 border rounded-l focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                            />
                            <button
                              onClick={handleAddCustomDisease}
                              className="bg-farmsoc-primary text-white px-2 py-1 rounded-r"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    className="px-4 py-2 bg-farmsoc-primary text-white rounded"
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </button>
                  <button 
                    className="px-4 py-2 border border-gray-300 rounded"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
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
                    <h3 className="text-sm text-gray-500">Health Conditions</h3>
                    {user?.diseases && user.diseases.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.diseases.map(disease => (
                          <div key={disease} className="bg-farmsoc-light text-farmsoc-primary px-2 py-1 rounded-full text-sm">
                            {disease}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>None specified</p>
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
              </>
            )}
          </div>
        )}
        
        {/* Family section */}
        {activeSection === 'family' && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Family Members</h2>
            </div>
            
            {user?.familyMembers && user.familyMembers.length > 0 ? (
              <div className="mb-6 space-y-3">
                {user.familyMembers.map(member => (
                  <div key={member.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">
                        {member.relationship}
                        {member.age && `, ${member.age} years old`}
                      </div>
                    </div>
                    <button 
                      className="text-red-500 text-sm"
                      onClick={() => handleRemoveFamilyMember(member.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 mb-6 bg-gray-50 rounded">
                <Users size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No family members added yet.</p>
                <p className="text-sm text-gray-500">Add family members to get personalized recommendations for your family.</p>
              </div>
            )}
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Add a Family Member</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newFamilyMember.name}
                    onChange={handleFamilyMemberInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                    placeholder="Enter name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Relationship
                  </label>
                  <select
                    name="relationship"
                    value={newFamilyMember.relationship}
                    onChange={handleFamilyMemberInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                  >
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Age (optional)
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={newFamilyMember.age || ''}
                    onChange={handleFamilyMemberInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-farmsoc-primary"
                    placeholder="Enter age"
                    min="1"
                    max="120"
                  />
                </div>
                
                <button 
                  className="px-4 py-2 bg-farmsoc-primary text-white rounded flex items-center"
                  onClick={handleAddFamilyMember}
                >
                  <PlusCircle size={16} className="mr-1" />
                  Add Member
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Orders section */}
        {activeSection === 'orders' && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Your Orders</h2>
            
            {isOrdersLoading ? (
              <div className="text-center p-8">
                <div className="w-10 h-10 border-4 border-farmsoc-light border-t-farmsoc-primary rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded">
                <ShoppingBag size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No orders yet.</p>
                <p className="text-sm text-gray-500">Your order history will appear here once you make a purchase.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border rounded p-4">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">Order #{order.id}</div>
                      <div className={`text-sm px-2 py-0.5 rounded-full ${
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
                      {order.items.map(item => (
                        <div key={item.productId} className="flex justify-between py-1 border-b last:border-b-0">
                          <div>
                            <div>{item.productName}</div>
                            <div className="text-sm text-gray-500">
                              {item.quantity} x ₹{item.unitPrice}
                            </div>
                          </div>
                          <div className="font-medium">₹{item.totalPrice}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between pt-2 font-medium">
                      <div>Total</div>
                      <div>₹{order.totalAmount}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Payment section */}
        {activeSection === 'payment' && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
            
            <div className="text-center p-8 bg-gray-50 rounded">
              <CreditCard size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No payment methods saved yet.</p>
              <p className="text-sm text-gray-500">Add a credit card or other payment method for faster checkout.</p>
              <button className="mt-4 px-4 py-2 bg-farmsoc-primary text-white rounded">
                Add Payment Method
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerProfile;
