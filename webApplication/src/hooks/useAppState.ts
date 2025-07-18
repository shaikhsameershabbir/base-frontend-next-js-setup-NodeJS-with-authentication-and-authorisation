import { useGlobalContext } from '@/contexts/GlobalContext';

// Custom hooks for specific state access
export const useUser = () => {
  const { state: { user } } = useGlobalContext();
  return user;
};

export const useAuth = () => {
  const { state: { isAuthenticated, loading, error }, login, logout, refreshUser } = useGlobalContext();
  return { isAuthenticated, loading, error, login, logout, refreshUser };
};

export const useBalance = () => {
  const { state: { user }, updateBalance } = useGlobalContext();
  return {
    balance: user?.balance || 0,
    updateBalance
  };
};

export const useAppLoading = () => {
  const { state: { loading } } = useGlobalContext();
  return loading;
};

export const useAppError = () => {
  const { state: { error }, clearError } = useGlobalContext();
  return { error, clearError };
}; 