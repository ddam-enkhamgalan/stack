import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Refresh an expired access token using the refresh token
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    if (!token.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || !data.data.user || !data.data.token) {
      throw new Error('Invalid refresh response structure');
    }

    const authData = data.data;

    return {
      ...token,
      accessToken: authData.token,
      refreshToken: authData.refreshToken || token.refreshToken, // Keep old refresh token if new one not provided
      accessTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
      id: authData.user.id,
      role: authData.user.role,
      error: undefined, // Clear any previous errors
    };
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'user@example.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        try {
          // Login to our API
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error?.message || 'Authentication failed');
          }

          // The API returns data in data.data structure
          const authData = data.data;
          if (!authData || !authData.user) {
            throw new Error('Invalid response structure from API');
          }

          // Return user object with tokens
          return {
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.name,
            role: authData.user.role,
            accessToken: authData.token,
            refreshToken: authData.refreshToken,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw new Error(error instanceof Error ? error.message : 'Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        console.log('🔑 JWT: Initial sign in with user:', user.id);
      } else {
        console.log('🔑 JWT: Token refresh/validation');
      }
      console.log('JWT callback called:', { hasUser: !!user, trigger, tokenId: token.id });

      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.id = user.id;

        // Set a custom expiry time (24 hours from now)
        const expiry = Date.now() + 24 * 60 * 60 * 1000;
        token.accessTokenExpires = expiry;

        console.log('Token created with expiry:', {
          now: Date.now(),
          expiry,
          userId: user.id,
          role: user.role,
        });
      }

      // Handle session update trigger
      if (trigger === 'update' && session) {
        return { ...token, ...session };
      }

      // Check token validity with detailed logging
      console.log('🔍 Token validation check');
      const now = Date.now();
      const expiry = token.accessTokenExpires as number;
      console.log('Token check:', { now, expiry, hasExpiry: !!expiry, isValid: expiry && now < expiry });

      // Return token if still valid
      if (expiry && now < expiry) {
        console.log('✅ Token is valid, returning');
        return token;
      }

      // If no expiry is set, assume token is valid (for backward compatibility)
      if (!expiry) {
        console.log('⚠️ No expiry set on token, returning as valid');
        return token;
      }

      // Token is expired, try to refresh it
      console.log('🔄 Token expired, attempting refresh');
      try {
        const refreshedToken = await refreshAccessToken(token);
        console.log('✅ Token refreshed successfully');
        return refreshedToken;
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        };
      }
    },
    async session({ session, token }) {
      console.log('Session callback called:', {
        hasToken: !!token,
        tokenId: token.id,
        tokenError: token.error,
        sessionUserId: session.user?.id,
      });

      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
        session.error = token.error as string;
      }

      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
