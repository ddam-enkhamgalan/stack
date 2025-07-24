'use client';

import { useAuthGuard } from '@/hooks/use-auth-guard';
import { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string;
  redirectTo?: string;
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  requiredRole,
  redirectTo,
  fallback = <div className="flex min-h-screen items-center justify-center">Loading...</div>,
}: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useAuthGuard({
    requiredRole,
    redirectTo,
  });

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return null; // Redirect is handled by the hook
  }

  return <>{children}</>;
}
