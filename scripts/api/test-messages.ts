#!/usr/bin/env tsx

/**
 * Test script to verify the messages system works correctly
 */

import { ApiMessages, HealthMessages } from '../../api/src/messages/index.js';

console.log('🧪 Testing Messages System\n');

// Test API messages
console.log('📝 API Success Messages:');
console.log('  Users Retrieved:', ApiMessages.success.users.retrieved());
console.log('  User Created:', ApiMessages.success.users.created());
console.log('  User Fetched:', ApiMessages.success.users.fetched());

console.log('\n❌ API Error Messages:');
console.log('  Invalid User ID:', ApiMessages.errors.validation.invalidUserId());
console.log('  User Not Found:', ApiMessages.errors.validation.userNotFound());
console.log('  Name Required:', ApiMessages.errors.validation.nameRequired());
console.log('  Email Required:', ApiMessages.errors.validation.emailRequired());
console.log('  Email Exists:', ApiMessages.errors.validation.emailExists());

console.log('\n🌐 HTTP Error Messages:');
console.log('  Not Found:', ApiMessages.errors.http.notFound());
console.log('  Not Found Description:', ApiMessages.errors.http.notFoundDescription());
console.log('  Rate Limit Exceeded:', ApiMessages.errors.http.rateLimitExceeded());

console.log('\n💚 Health Messages:');
console.log('  OK Status:', HealthMessages.status.ok());
console.log('  Error Status:', HealthMessages.status.error());

console.log('\n✅ Messages system test completed successfully!');
