
import React from 'react';
import { render, screen } from '../utils/test-utils';
import AppNavigator from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the components
jest.mock('../../pages/consumer/ConsumerHome', () => () => <div>ConsumerHome</div>);
jest.mock('../../pages/farmer/FarmerHome', () => () => <div>FarmerHome</div>);
jest.mock('../../pages/influencer/InfluencerHome', () => () => <div>InfluencerHome</div>);
jest.mock('../../pages/auth/Login', () => () => <div>Login</div>);
jest.mock('../../navigation/AppLayout', () => ({ children }: { children: React.ReactNode }) => (
  <div data-testid="app-layout">{children}</div>
));
jest.mock('../../components/common/LoadingScreen', () => () => <div>Loading</div>);

describe('AppNavigator Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading screen when auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={['/app/home']}>
        <AppNavigator />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  test('redirects to login when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={['/app/home']}>
        <AppNavigator />
      </MemoryRouter>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('renders consumer home for consumer users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: 'consumer1',
        role: 'consumer',
      },
    });

    render(
      <MemoryRouter initialEntries={['/app/home']}>
        <AppNavigator />
      </MemoryRouter>
    );

    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    expect(screen.getByText('ConsumerHome')).toBeInTheDocument();
  });

  test('renders farmer home for farmer users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: 'farmer1',
        role: 'farmer',
      },
    });

    render(
      <MemoryRouter initialEntries={['/app/home']}>
        <AppNavigator />
      </MemoryRouter>
    );

    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    expect(screen.getByText('FarmerHome')).toBeInTheDocument();
  });

  test('renders influencer home for influencer users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: 'influencer1',
        role: 'influencer',
      },
    });

    render(
      <MemoryRouter initialEntries={['/app/home']}>
        <AppNavigator />
      </MemoryRouter>
    );

    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    expect(screen.getByText('InfluencerHome')).toBeInTheDocument();
  });

  test('allows access to auth routes when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={['/app/auth/login']}>
        <AppNavigator />
      </MemoryRouter>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
