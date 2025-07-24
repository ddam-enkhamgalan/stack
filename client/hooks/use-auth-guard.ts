'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface UseAuthGuardOptions {
  redirectTo?: string;
  requiredRole?: string;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { redirectTo = '/auth/signin', requiredRole } = options;

  useEffect(() => {
    // Loading state
    if (status === 'loading') return;

    // Not authenticated
    if (status === 'unauthenticated') {
      router.push(redirectTo);
      return;
    }

    // Check for token errors
    if (session?.error === 'RefreshAccessTokenError') {
      router.push('/auth/signin?error=session-expired');
      return;
    }

    // Check role requirements
    if (requiredRole && session?.user?.role !== requiredRole) {
      router.push('/unauthorized');
      return;
    }
  }, [status, session, router, redirectTo, requiredRole]);

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user,
  };
}
