import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import Header from '../components/Header';
import { CheckCircle, AlertCircle, Mail, RefreshCw } from 'lucide-react';

const DashboardPage = () => {
  const { user, updateUserEmailStatus, checkAuthStatus, refreshUserData } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { data: dashboardData, isLoading, error, refetch } = useQuery(
    'dashboard',
    authAPI.getDashboard,
    {
      retry: 1,
      // Refetch when window focus returns (useful for email verification in another tab)
      refetchOnWindowFocus: true,
      // Poll every 30 seconds if email is not validated
      refetchInterval: user?.emailValidated ? false : 30000,
      onError: (error) => {
        toast.error('Failed to load dashboard data');
        console.error('Dashboard error:', error);
      }
    }
  );

  // Refetch dashboard data when user's email validation status changes
  useEffect(() => {
    if (user?.emailValidated) {
      refetch();
    }
  }, [user?.emailValidated, refetch]);

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      // Debug: Check session data first
      console.log('Current user in context:', user);
      
      try {
        const debugData = await authAPI.debugSession();
        console.log('Session debug data:', debugData);
      } catch (debugError) {
        console.error('Debug session failed:', debugError);
      }
      
      // Refresh user data from backend to get latest email validation status
      const refreshedUser = await refreshUserData();
      
      if (refreshedUser) {
        // Also refetch dashboard data
        await refetch();
        toast.success('Status refreshed!');
      } else {
        // User no longer exists in database
        toast.error('Your account no longer exists. You have been logged out.');
      }
    } catch (error) {
      console.error('Refresh error:', error);
      if (error.message.includes('User no longer exists') || 
          error.message.includes('User not found')) {
        toast.error('Your account no longer exists. Please sign up again.');
      } else if (error.message.includes('Authentication required')) {
        toast.error('Session expired. Please refresh the page.');
      } else {
        toast.error('Failed to refresh status. Please try again.');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) {
      toast.error('User email not found');
      return;
    }

    setResendLoading(true);
    try {
      await authAPI.resendVerification(user.email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  const isEmailValidated = user?.emailValidated;
  const statusMessage = dashboardData?.message || 
    (isEmailValidated 
      ? 'Your email is validated. You can access the portal' 
      : 'You need to validate your email to access the portal');

  if (isLoading) {
    return (
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-content">
          <div className="container">
            <div className="status-card">
              <div className="loading-spinner"></div>
              <p className="mt-4">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-content">
          <div className="container">
            <div className="status-card">
              <div className="status-icon warning">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="status-title">Error Loading Dashboard</h2>
              <p className="status-message">
                There was an error loading your dashboard. Please try refreshing the page.
              </p>
              <button 
                onClick={() => refetch()}
                className="btn btn-primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-content">
        <div className="container">
          <div className="status-card">
            <div className={`status-icon ${isEmailValidated ? 'success' : 'warning'}`}>
              {isEmailValidated ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <Mail className="w-8 h-8" />
              )}
            </div>
            
            <h2 className="status-title">
              {isEmailValidated ? 'Welcome to the Portal!' : 'Email Verification Required'}
            </h2>
            
            <p className="status-message">
              {statusMessage}
            </p>

            {!isEmailValidated && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className={`btn btn-primary flex-1 ${resendLoading ? 'btn-loading' : ''}`}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                  
                  <button
                    onClick={handleRefreshStatus}
                    disabled={refreshing}
                    className={`btn btn-secondary flex-1 ${refreshing ? 'btn-loading' : ''}`}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Check Status'}
                  </button>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">📧 Email Verification Pending</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Welcome! Your account has been created successfully. To access all portal features, 
                    please verify your email address.
                  </p>
                  <p className="text-xs text-blue-600">
                    • Check your inbox for a verification email<br/>
                    • Click the verification link in the email<br/>
                    • Return here and click "Check Status" to refresh<br/>
                    • The page will automatically refresh every 30 seconds
                  </p>
                </div>
              </div>
            )}

            {isEmailValidated && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  🎉 Account Fully Activated!
                </h3>
                <p className="text-green-700">
                  Your email has been verified and your account is ready to use. 
                  You now have full access to all portal features.
                </p>
              </div>
            )}
          </div>

          {/* User Information Card */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Email:</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Account ID:</span>
                <span>{user?.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Email Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isEmailValidated 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isEmailValidated ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Last Updated:</span>
                <span>{dashboardData?.timestamp ? new Date(dashboardData.timestamp).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;