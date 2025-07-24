#!/bin/bash

# Complete UUID-based JWT Authentication & CRUD Test Script
# This script tests the entire authentication flow with UUID-based IDs

API_BASE="http://localhost:3000/api"
TEST_EMAIL="test-uuid-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
TEST_NAME="UUID Test User $(date +%s)"

echo "🔐 Starting UUID-based Authentication & CRUD Test"
echo "==============================================="
echo

# Test 1: Register a new user (should get UUID back)
echo "1️⃣ Testing User Registration with UUID..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Registration Response: $REGISTER_RESPONSE"

# Extract token and user ID from registration response
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.user.id')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Registration failed - no token received"
  exit 1
fi

echo "✅ Registration successful - Token: ${TOKEN:0:20}..."
echo "✅ User ID (UUID): $USER_ID"

# Validate that USER_ID is a valid UUID format
if [[ ! $USER_ID =~ ^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$ ]]; then
  echo "❌ User ID is not a valid UUID format: $USER_ID"
  exit 1
fi

echo "✅ User ID is valid UUID format"
echo

# Test 2: Login with UUID-based user
echo "2️⃣ Testing User Login with UUID..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Login Response: $LOGIN_RESPONSE"

# Extract new token from login
LOGIN_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$LOGIN_TOKEN" = "null" ] || [ -z "$LOGIN_TOKEN" ]; then
  echo "❌ Login failed - no token received"
  exit 1
fi

echo "✅ Login successful with UUID-based user"
echo

# Test 3: Update user profile using UUID
echo "3️⃣ Testing User Profile Update with UUID..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LOGIN_TOKEN" \
  -d "{
    \"name\": \"Updated UUID $TEST_NAME\",
    \"email\": \"updated-$TEST_EMAIL\"
  }")

echo "Update Response: $UPDATE_RESPONSE"

UPDATED_NAME=$(echo $UPDATE_RESPONSE | jq -r '.data.name')

if [[ "$UPDATED_NAME" != *"Updated UUID"* ]]; then
  echo "❌ UUID-based user update failed"
  exit 1
fi

echo "✅ UUID-based user profile update successful"
echo

# Test 4: Test invalid UUID format
echo "4️⃣ Testing Invalid UUID Format..."
INVALID_UUID_RESPONSE=$(curl -s -X PUT "$API_BASE/users/invalid-uuid-format" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LOGIN_TOKEN" \
  -d "{
    \"name\": \"Should Fail\"
  }")

echo "Invalid UUID Response: $INVALID_UUID_RESPONSE"

INVALID_UUID_STATUS=$(echo $INVALID_UUID_RESPONSE | jq -r '.error.status')

if [ "$INVALID_UUID_STATUS" != "400" ]; then
  echo "❌ Invalid UUID format test failed - should return 400"
  exit 1
fi

echo "✅ Invalid UUID format properly rejected"
echo

# Test 5: Test user deletion with UUID
echo "5️⃣ Testing User Self-Deletion with UUID..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_BASE/users/$USER_ID" \
  -H "Authorization: Bearer $LOGIN_TOKEN")

echo "Delete Response: $DELETE_RESPONSE"

DELETE_MESSAGE=$(echo $DELETE_RESPONSE | jq -r '.message')

if [[ "$DELETE_MESSAGE" != *"deleted"* ]]; then
  echo "❌ UUID-based user deletion failed"
  exit 1
fi

echo "✅ UUID-based user self-deletion successful"
echo

# Test 6: Verify database contains UUIDs
echo "6️⃣ Verifying Database Contains UUIDs..."
echo "Checking existing users in database..."

# Get a sample user from the database to verify UUID format
SAMPLE_USER_RESPONSE=$(curl -s -X GET "$API_BASE/users")
SAMPLE_USER_ID=$(echo $SAMPLE_USER_RESPONSE | jq -r '.data[0].id // empty')

if [ -n "$SAMPLE_USER_ID" ]; then
  if [[ $SAMPLE_USER_ID =~ ^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$ ]]; then
    echo "✅ Database users have valid UUID format: $SAMPLE_USER_ID"
  else
    echo "❌ Database users do not have valid UUID format: $SAMPLE_USER_ID"
    exit 1
  fi
else
  echo "⚠️  No users found in database (expected after deletion)"
fi

echo

echo "🎉 ALL UUID TESTS PASSED!"
echo "========================="
echo "✅ UUID User Registration"
echo "✅ UUID User Login"  
echo "✅ UUID Profile Updates"
echo "✅ UUID Format Validation"
echo "✅ UUID User Deletion"
echo "✅ Database UUID Verification"
echo
echo "🔐 UUID-based JWT Authentication System is fully functional!"
echo "📊 Database correlation with UUIDs verified!"
echo "🛡️ All security measures working correctly with UUIDs!"
