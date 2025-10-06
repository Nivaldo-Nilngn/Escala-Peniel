// hooks/useAuth.ts
import { useAuth as useAuthContext } from '../contexts/AuthContext';

// Re-export do AuthContext para manter compatibilidade
export const useAuth = useAuthContext;
