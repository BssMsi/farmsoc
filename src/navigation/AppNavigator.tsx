
import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user';
import AppLayout from './AppLayout';
import LoadingScreen from '../components/common/LoadingScreen';

// Lazy loaded consumer screens
const ConsumerHome = lazy(() => import('../pages/consumer/ConsumerHome'));
const ConsumerExplore = lazy(() => import('../pages/consumer/ConsumerExplore'));
const ConsumerEvents = lazy(() => import('../pages/consumer/ConsumerEvents'));
const ConsumerCart = lazy(() => import('../pages/consumer/ConsumerCart'));
const ConsumerProfile = lazy(() => import('../pages/consumer/ConsumerProfile'));
const ConsumerProductDetail = lazy(() => import('../pages/consumer/ConsumerProductDetail'));

// Lazy loaded farmer screens
const FarmerHome = lazy(() => import('../pages/farmer/FarmerHome'));
const FarmerAddContent = lazy(() => import('../pages/farmer/FarmerAddContent'));
const FarmerEvents = lazy(() => import('../pages/farmer/FarmerEvents'));
const FarmerCropRequests = lazy(() => import('../pages/farmer/FarmerCropRequests'));
const FarmerProfile = lazy(() => import('../pages/farmer/FarmerProfile'));

// Lazy loaded influencer screens
const InfluencerHome = lazy(() => import('../pages/influencer/InfluencerHome'));
const InfluencerDashboard = lazy(() => import('../pages/influencer/InfluencerDashboard'));
const InfluencerCollaborations = lazy(() => import('../pages/influencer/InfluencerCollaborations'));
const InfluencerRequirements = lazy(() => import('../pages/influencer/InfluencerRequirements'));
const InfluencerProfile = lazy(() => import('../pages/influencer/InfluencerProfile'));

// Common screens
const Messages = lazy(() => import('../pages/common/Messages'));
const Chat = lazy(() => import('../pages/common/Chat'));
const Login = lazy(() => import('../pages/auth/Login'));
const SignUp = lazy(() => import('../pages/auth/SignUp'));

const AppNavigator: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated and trying to access protected routes
  if (!isAuthenticated && !location.pathname.includes('/auth')) {
    return <Navigate to="/app/auth/login" replace />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Auth routes */}
        <Route path="auth">
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
        </Route>

        {/* Protected routes with layout */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <AppLayout>
                <Routes>
                  {/* Consumer routes */}
                  {user?.role === 'consumer' && (
                    <>
                      <Route path="home" element={<ConsumerHome />} />
                      <Route path="explore" element={<ConsumerExplore />} />
                      <Route path="events" element={<ConsumerEvents />} />
                      <Route path="cart" element={<ConsumerCart />} />
                      <Route path="profile" element={<ConsumerProfile />} />
                      <Route path="product/:id" element={<ConsumerProductDetail />} />
                      <Route path="*" element={<Navigate to="/app/home" replace />} />
                    </>
                  )}

                  {/* Farmer routes */}
                  {user?.role === 'farmer' && (
                    <>
                      <Route path="home" element={<FarmerHome />} />
                      <Route path="add" element={<FarmerAddContent />} />
                      <Route path="events" element={<FarmerEvents />} />
                      <Route path="crop-requests" element={<FarmerCropRequests />} />
                      <Route path="profile" element={<FarmerProfile />} />
                      <Route path="*" element={<Navigate to="/app/home" replace />} />
                    </>
                  )}

                  {/* Influencer routes */}
                  {user?.role === 'influencer' && (
                    <>
                      <Route path="home" element={<InfluencerHome />} />
                      <Route path="dashboard" element={<InfluencerDashboard />} />
                      <Route path="collaborations" element={<InfluencerCollaborations />} />
                      <Route path="requirements" element={<InfluencerRequirements />} />
                      <Route path="profile" element={<InfluencerProfile />} />
                      <Route path="*" element={<Navigate to="/app/home" replace />} />
                    </>
                  )}

                  {/* Common routes */}
                  <Route path="messages" element={<Messages />} />
                  <Route path="chat/:id" element={<Chat />} />
                  
                  {/* Default redirect based on role */}
                  <Route 
                    path="" 
                    element={<Navigate to="/app/home" replace />} 
                  />
                </Routes>
              </AppLayout>
            ) : (
              <Navigate to="/app/auth/login" replace />
            )
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppNavigator;
