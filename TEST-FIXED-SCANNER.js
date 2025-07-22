// TEST SCRIPT FOR FIXED CHANNEL SCANNER
// Run this in browser console after authentication to test the fix

console.log('🧪 TESTING FIXED CHANNEL SCANNER');
console.log('=====================================');

// 1. Check current authentication state
const userId = localStorage.getItem('telegram_user_id');
const sessionId = localStorage.getItem('telegram_session_id');
const userInfo = localStorage.getItem('telegram_user_info');

console.log('📋 Current Authentication State:');
console.log('  User ID:', userId);
console.log('  Session ID:', sessionId ? 'Present' : 'Missing');
console.log('  User Info:', userInfo ? 'Present' : 'Missing');

if (!userId || !sessionId) {
  console.log('❌ Authentication missing. Please click "Connect Telegram" first.');
} else {
  console.log('✅ Authentication found. Ready to test channel scanning.');
  console.log('');
  console.log('📝 TEST INSTRUCTIONS:');
  console.log('1. Try scanning a public channel: "btcgroupindia"');
  console.log('2. The scanner should now handle null/undefined values gracefully');
  console.log('3. No more "toLocaleString" errors should occur');
  console.log('4. Real Telegram data should display properly');
} 