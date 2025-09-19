import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const { updateUserEmailStatus } = useAuth();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
      setMessage('Verification token is missing from the URL');
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      const response = await authAPI.verifyEmail(verificationToken);
      setVerificationStatus('success');
      setMessage(response.message || 'Email verified successfully!');
      
      // Update user's email status in context if they're logged in
      await updateUserEmailStatus(true);
      
      toast.success('Email verified successfully!');
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      setVerificationStatus('error');
      setMessage(error.message || 'Email verification failed');
      toast.error('Email verification failed');
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-600" />;
      default:
        return <div className="loading-spinner w-12 h-12" />;
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Email Verified Successfully!';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Verifying Your Email...';
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="text-center mb-6">
          <div className="mb-4">
            {getStatusIcon()}
          </div>
          
          <h1 className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
            {getStatusTitle()}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {verificationStatus === 'verifying' && (
            <div className="text-sm text-gray-500">
              Please wait while we verify your email address...
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Verification Complete!</span>
              </div>
              <p className="text-green-700 text-sm">
                Your email has been successfully verified. You will be redirected to your dashboard shortly.
              </p>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="bg-red-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">Verification Failed</span>
              </div>
              <p className="text-red-700 text-sm mb-4">
                The verification link may have expired or is invalid. You can request a new verification email from your dashboard.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/dashboard"
            className="btn btn-primary flex-1 text-center"
          >
            Go to Dashboard
          </Link>
          
          {verificationStatus === 'error' && (
            <Link
              to="/login"
              className="btn btn-secondary flex-1 text-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          )}
        </div>

        {verificationStatus === 'success' && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Redirecting to dashboard in 3 seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
