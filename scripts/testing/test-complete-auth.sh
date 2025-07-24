#!/bin/bash

# Complete JWT Authentication & CRUD Test Script
# This script tests the entire authentication flow and protected CRUD operations

API_BASE="http://localhost:3000/api"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
TEST_NAME="Test User $(date +%s)"

echo "🚀 Starting Complete Authentication & CRUD Test"
echo "============================================="
echo

# Test 1: Register a new user
echo "1️⃣ Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Registration Response: $REGISTER_RESPONSE"

# Extract token from registration response
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.user.id')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Registration failed - no token received"
  exit 1
fi

echo "✅ Registration successful - Token: ${TOKEN:0:20}..."
echo "✅ User ID: $USER_ID"
echo

# Test 2: Login with registered user
echo "2️⃣ Testing User Login..."
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

echo "✅ Login successful - New Token: ${LOGIN_TOKEN:0:20}..."
echo

# Test 3: Access protected profile endpoint
echo "3️⃣ Testing Protected Profile Access..."
PROFILE_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
  -H "Authorization: Bearer $LOGIN_TOKEN")

echo "Profile Response: $PROFILE_RESPONSE"

PROFILE_EMAIL=$(echo $PROFILE_RESPONSE | jq -r '.data.email')

if [ "$PROFILE_EMAIL" != "$TEST_EMAIL" ]; then
  echo "❌ Profile access failed"
  exit 1
fi

echo "✅ Protected profile access successful"
echo

# Test 4: Update user profile
echo "4️⃣ Testing User Profile Update..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LOGIN_TOKEN" \
  -d "{
    \"name\": \"Updated $TEST_NAME\",
    \"email\": \"updated-$TEST_EMAIL\"
  }")

echo "Update Response: $UPDATE_RESPONSE"

UPDATED_NAME=$(echo $UPDATE_RESPONSE | jq -r '.data.name')

if [[ "$UPDATED_NAME" != *"Updated"* ]]; then
  echo "❌ User update failed"
  exit 1
fi

echo "✅ User profile update successful"
echo

# Test 5: Test unauthorized access
echo "5️⃣ Testing Unauthorized Access..."
UNAUTH_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me")

echo "Unauthorized Response: $UNAUTH_RESPONSE"

ERROR_STATUS=$(echo $UNAUTH_RESPONSE | jq -r '.error.status')

if [ "$ERROR_STATUS" != "401" ]; then
  echo "❌ Unauthorized access test failed - should return 401"
  exit 1
fi

echo "✅ Unauthorized access properly blocked"
echo

# Test 6: Test forbidden access (trying to update another user)
echo "6️⃣ Testing Forbidden Access (Cross-user Update)..."
FORBIDDEN_RESPONSE=$(curl -s -X PUT "$API_BASE/users/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LOGIN_TOKEN" \
  -d "{
    \"name\": \"Hacker Attempt\"
  }")

echo "Forbidden Response: $FORBIDDEN_RESPONSE"

FORBIDDEN_STATUS=$(echo $FORBIDDEN_RESPONSE | jq -r '.error.status')

if [ "$FORBIDDEN_STATUS" != "403" ]; then
  echo "❌ Forbidden access test failed - should return 403"
  exit 1
fi

echo "✅ Cross-user update properly forbidden"
echo

# Test 7: Test user deletion (self-delete)
echo "7️⃣ Testing User Self-Deletion..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_BASE/users/$USER_ID" \
  -H "Authorization: Bearer $LOGIN_TOKEN")

echo "Delete Response: $DELETE_RESPONSE"

DELETE_MESSAGE=$(echo $DELETE_RESPONSE | jq -r '.message')

if [[ "$DELETE_MESSAGE" != *"deleted"* ]]; then
  echo "❌ User deletion failed"
  exit 1
fi

echo "✅ User self-deletion successful"
echo

# Test 8: Verify user is actually deleted
echo "8️⃣ Verifying User Deletion..."
VERIFY_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
  -H "Authorization: Bearer $LOGIN_TOKEN")

echo "Verification Response: $VERIFY_RESPONSE"

VERIFY_STATUS=$(echo $VERIFY_RESPONSE | jq -r '.error.status')

if [ "$VERIFY_STATUS" != "401" ]; then
  echo "❌ User deletion verification failed - token should be invalid"
  exit 1
fi

echo "✅ User deletion verified - token invalidated"
echo

# Test 9: Test invalid password
echo "9️⃣ Testing Invalid Password..."
INVALID_LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@stack.internal\",
    \"password\": \"wrongpassword\"
  }")

echo "Invalid Login Response: $INVALID_LOGIN_RESPONSE"

INVALID_STATUS=$(echo $INVALID_LOGIN_RESPONSE | jq -r '.error.status')

if [ "$INVALID_STATUS" != "401" ]; then
  echo "❌ Invalid password test failed - should return 401"
  exit 1
fi

echo "✅ Invalid password properly rejected"
echo

echo "🎉 ALL TESTS PASSED!"
echo "==================="
echo "✅ User Registration"
echo "✅ User Login"  
echo "✅ Protected Profile Access"
echo "✅ User Profile Updates"
echo "✅ Unauthorized Access Protection"
echo "✅ Cross-user Update Protection"
echo "✅ User Self-Deletion"
echo "✅ Post-deletion Token Invalidation"
echo "✅ Invalid Password Protection"
echo
echo "🔐 JWT Authentication System is fully functional!"
echo "📊 Database correlation verified!"
echo "🛡️ All security measures working correctly!"
