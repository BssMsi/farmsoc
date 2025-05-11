import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, updateCartItem, removeFromCart, clearCart, createOrder, performHealthCheck, HealthCheckResponse } from '../../services/apiService';
import { CartItem } from '../../types/product';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ConsumerCart: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [healthCheckResults, setHealthCheckResults] = useState<Record<string, HealthCheckResponse>>({});
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [selectedHealthInfo, setSelectedHealthInfo] = useState<HealthCheckResponse | null>(null);
  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || '',
    street: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    phoneNumber: user?.phoneNumber || ''
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
  // Get cart items
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart
  });
  
  // Perform health check when cart changes and user has diseases
  useEffect(() => {
    const performHealthCheckIfNeeded = async () => {
      if (cartItems.length > 0 && user?.diseases && user.diseases.length > 0) {
        try {
          const results = await performHealthCheck(user.diseases, cartItems);
          
          // Convert array to a lookup object by productId for easy access
          const resultsMap: Record<string, HealthCheckResponse> = {};
          results.forEach(result => {
            resultsMap[result.productId] = result;
          });
          
          setHealthCheckResults(resultsMap);
        } catch (error) {
          console.error('Health check error:', error);
        }
      }
    };
    
    performHealthCheckIfNeeded();
  }, [cartItems, user?.diseases]);
  
  // Calculate cart totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.price * item.quantity), 
    0
  );
  const deliveryFee = subtotal > 0 ? 50 : 0; // Example delivery fee
  const total = subtotal + deliveryFee;
  
  // Update item quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string, quantity: number }) => 
      updateCartItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
  
  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: (productId: string) => removeFromCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    }
  });
  
  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: () => {
      if (!user) return Promise.reject('User not logged in');
      
      return createOrder({
        customerId: user.id,
        items: cartItems,
        shippingAddress: shippingDetails,
        billingAddress: shippingDetails, // Using same address for billing
        paymentMethod
      });
    },
    onSuccess: async () => {
      await clearCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setIsCheckingOut(false);
      toast({
        title: "Order placed",
        description: "Your order has been successfully placed!",
      });
      navigate('/app/home');
    },
    onError: (error) => {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleUpdateQuantity = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemMutation.mutate(item.productId);
    } else {
      updateQuantityMutation.mutate({ 
        productId: item.productId, 
        quantity: newQuantity 
      });
    }
  };
  
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!shippingDetails.name || !shippingDetails.street || !shippingDetails.city ||
        !shippingDetails.state || !shippingDetails.postalCode || !shippingDetails.phoneNumber) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    checkoutMutation.mutate();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openHealthModal = (result: HealthCheckResponse) => {
    setSelectedHealthInfo(result);
    setIsHealthModalOpen(true);
  };
  
  const closeHealthModal = () => {
    setIsHealthModalOpen(false);
    setSelectedHealthInfo(null);
  };

  return (
    <div className="h-full bg-gray-50 pb-16">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold">Your Cart</h1>
      </div>
      
      {/* Health Info Modal */}
      {isHealthModalOpen && selectedHealthInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Health Information
              </h3>
              <button 
                onClick={closeHealthModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-4 flex items-start">
              {selectedHealthInfo.flag === 'pass' ? (
                <CheckCircle size={24} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
              ) : (
                <AlertTriangle size={24} className="text-amber-500 mr-2 flex-shrink-0 mt-1" />
              )}
              <p className="text-gray-700">{selectedHealthInfo.comments}</p>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">
                This information is based on your health conditions and our product database. 
                Always consult with your healthcare provider for personalized advice.
              </p>
            </div>
            
            <button 
              className="mt-4 w-full py-2 bg-kisanly-primary text-white rounded-lg"
              onClick={closeHealthModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      <div className="p-4">
        {isLoading ? (
          <div className="text-center p-8">
            <div className="w-10 h-10 border-4 border-kisanly-light border-t-kisanly-primary rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">Your cart is empty.</p>
            <p className="text-gray-500 text-sm mt-1">Add some products to get started!</p>
            <button 
              className="mt-4 px-4 py-2 bg-kisanly-primary text-white rounded-lg"
              onClick={() => navigate('/app/explore')}
            >
              Browse Products
            </button>
          </div>
        ) : !isCheckingOut ? (
          <>
            <div className="bg-white rounded-lg shadow mb-4">
              {cartItems.map(item => (
                <div key={item.productId} className="p-4 border-b last:border-b-0 flex">
                  <img 
                    src={item.product.images[0] || 'https://via.placeholder.com/80'} 
                    alt={item.product.name} 
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <h3 className="font-medium">{item.product.name}</h3>
                        {healthCheckResults[item.productId] && (
                          <button 
                            className="ml-2"
                            onClick={() => openHealthModal(healthCheckResults[item.productId])}
                          >
                            {healthCheckResults[item.productId].flag === 'pass' ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <AlertTriangle size={16} className="text-amber-500" />
                            )}
                          </button>
                        )}
                      </div>
                      <button 
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => removeItemMutation.mutate(item.productId)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm">{item.product.category}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="text-kisanly-primary font-semibold">
                        ₹{item.product.price}
                      </div>
                      <div className="flex items-center border rounded">
                        <button 
                          className="px-2 py-1 text-gray-500"
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-3 py-1 border-x">{item.quantity}</span>
                        <button 
                          className="px-2 py-1 text-gray-500"
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="font-semibold mb-3">Order Summary</h2>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                className="w-full py-3 bg-kisanly-primary text-white rounded-lg font-medium"
                onClick={() => setIsCheckingOut(true)}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="font-semibold mb-4">Checkout</h2>
            <form onSubmit={handleCheckout}>
              <h3 className="font-medium mb-2">Shipping Information</h3>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={shippingDetails.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={shippingDetails.street}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingDetails.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingDetails.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingDetails.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={shippingDetails.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={shippingDetails.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-kisanly-primary"
                    required
                  />
                </div>
              </div>
              
              <h3 className="font-medium mb-2">Payment Method</h3>
              <div className="space-y-2 mb-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="mr-2"
                    />
                    UPI Payment
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => setPaymentMethod('credit_card')}
                      className="mr-2"
                    />
                    Credit / Debit Card
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="mr-2"
                    />
                    Cash on Delivery
                  </label>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-4">
                <h3 className="font-medium mb-2">Order Summary</h3>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button 
                  type="button"
                  className="flex-1 py-3 border border-kisanly-primary text-kisanly-primary rounded-lg font-medium"
                  onClick={() => setIsCheckingOut(false)}
                >
                  Go Back
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-kisanly-primary text-white rounded-lg font-medium"
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerCart;
