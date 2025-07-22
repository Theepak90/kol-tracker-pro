// CHECK USER ID SYNCHRONIZATION
// Run this in browser console to verify user ID sync

console.log('🔍 CHECKING USER ID SYNCHRONIZATION...');

const userId = localStorage.getItem('telegram_user_id');
const userInfo = localStorage.getItem('telegram_user_info');
const sessionId = localStorage.getItem('telegram_session_id');

console.log('📋 Current localStorage state:');
console.log('  user_id:', userId);
console.log('  session_id:', sessionId);
console.log('  user_info:', userInfo ? 'Present' : 'Missing');

if (sessionId && sessionId.includes('verified_user_')) {
  const match = sessionId.match(/verified_user_(\d+)_/);
  if (match) {
    const expectedUserId = `user_${match[1]}`;
    console.log('  expected_user_id (from session):', expectedUserId);
    
    if (userId === expectedUserId) {
      console.log('✅ USER ID SYNC: CORRECT');
    } else {
      console.log('❌ USER ID SYNC: MISMATCH!');
      console.log('  Fix: Need to update user_id to match session');
    }
  }
} else {
  console.log('⚠️  Session ID format not recognized or missing');
}

console.log('🔍 Sync check complete.'); 