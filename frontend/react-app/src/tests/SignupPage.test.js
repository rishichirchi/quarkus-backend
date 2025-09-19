import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import SignupPage from '../pages/SignupPage';
import AuthProvider from '../context/AuthContext';

// Mock the API
jest.mock('../services/api', () => ({
  authAPI: {
    signup: jest.fn(),
    getSession: jest.fn().mockResolvedValue({ authenticated: false, user: null })
  }
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('SignupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders signup form', () => {
    render(
      <TestWrapper>
        <SignupPage />
      </TestWrapper>
    );

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Choose a strong password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <TestWrapper>
        <SignupPage />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    });
  });

  test('shows validation error for password mismatch', async () => {
    render(
      <TestWrapper>
        <SignupPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByPlaceholderText('Choose a strong password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');

    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword' } });

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('shows validation error for weak password', async () => {
    render(
      <TestWrapper>
        <SignupPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByPlaceholderText('Choose a strong password');
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });
});
