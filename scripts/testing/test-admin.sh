#!/bin/bash

# Admin User Test Script
# Tests the admin user credentials

API_BASE="http://localhost:3000/api"
ADMIN_EMAIL="amgaa.lcs@gmail.com"
ADMIN_PASSWORD="qwertyQ123!"

echo "🔐 Testing Admin User Credentials"
echo "================================"
echo

# Test 1: Admin Login
echo "1️⃣ Testing Admin Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

echo "Login Response: $LOGIN_RESPONSE"

# Extract token and user info
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.data.user.id')
USER_NAME=$(echo $LOGIN_RESPONSE | jq -r '.data.user.name')
USER_ROLE=$(echo $LOGIN_RESPONSE | jq -r '.data.user.role // "user"')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Admin login failed - no token received"
  exit 1
fi

echo "✅ Admin login successful"
echo "   👤 Name: $USER_NAME"
echo "   📧 Email: $ADMIN_EMAIL" 
echo "   🔑 Role: $USER_ROLE"
echo "   🆔 ID: $USER_ID"
echo "   🎫 Token: ${TOKEN:0:20}..."
echo

# Test 2: Profile Access
echo "2️⃣ Testing Profile Access..."
PROFILE_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Profile Response: $PROFILE_RESPONSE"

PROFILE_EMAIL=$(echo $PROFILE_RESPONSE | jq -r '.data.email')

if [ "$PROFILE_EMAIL" = "$ADMIN_EMAIL" ]; then
  echo "✅ Profile access successful"
else
  echo "❌ Profile access failed"
  exit 1
fi
echo

# Test 3: List Users (Admin function)
echo "3️⃣ Testing User List Access..."
USERS_RESPONSE=$(curl -s -X GET "$API_BASE/users" \
  -H "Authorization: Bearer $TOKEN")

echo "Users Response: $USERS_RESPONSE"

USER_COUNT=$(echo $USERS_RESPONSE | jq -r '.data | length')

if [ "$USER_COUNT" -ge "1" ]; then
  echo "✅ User list access successful (found $USER_COUNT users)"
else
  echo "❌ User list access failed"
  exit 1
fi
echo

echo "🎉 All Admin Tests Passed!"
echo "========================="
echo "✅ Admin Login Working"
echo "✅ Profile Access Working"
echo "✅ Admin Functions Working"
echo
echo "🔐 Admin user is ready for use!"
echo "📧 Email: $ADMIN_EMAIL"
echo "🔑 Password: $ADMIN_PASSWORD"
