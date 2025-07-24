'use client';

import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { signOut } from 'next-auth/react';

function DashboardContent() {
  const { user, session } = useAuthGuard();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back!</CardTitle>
              <CardDescription>You are successfully authenticated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {user?.name || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user?.email || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Role:</span> {user?.role || 'N/A'}
              </div>
              <div>
                <span className="font-medium">User ID:</span> {user?.id || 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>Current session details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Has Access Token:</span> {session?.accessToken ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Session Error:</span> {session?.error || 'None'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>This page is protected by authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-green-50 p-4 text-green-700">
              <p className="font-medium">✅ Authentication Successful</p>
              <p className="text-sm">You can only see this page because you are authenticated.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
