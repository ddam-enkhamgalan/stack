import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define the registration schema
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { name, email, password } = validationResult.data;

    // Call the actual API backend
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const apiData = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json({ message: apiData.message || 'Registration failed' }, { status: apiResponse.status });
    }

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: apiData.data?.user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
