'use client';

import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { signOut } from 'next-auth/react';

function AdminContent() {
  const { user } = useAuthGuard({ requiredRole: 'admin' });

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>This page is restricted to admin users only</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-blue-50 p-4 text-blue-700">
              <p className="font-medium">🔐 Admin Role Required</p>
              <p className="text-sm">You can only see this page because you have admin role.</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Admin User Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {user?.name || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user?.email || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Role:</span>{' '}
                <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">{user?.role || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" disabled>
                Manage Users (Demo)
              </Button>
              <Button className="w-full" variant="outline" disabled>
                System Settings (Demo)
              </Button>
              <Button className="w-full" variant="outline" disabled>
                View Reports (Demo)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminContent />
    </AuthGuard>
  );
}
