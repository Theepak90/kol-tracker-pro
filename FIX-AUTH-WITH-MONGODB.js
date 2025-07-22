// FIX AUTHENTICATION WITH MONGODB SYNC
// Run this in browser console to fix the user ID mismatch

console.log('🔧 FIXING AUTHENTICATION WITH MONGODB SYNC...');

// 1. Clear all current authentication data
console.log('🧹 Clearing all authentication data...');
localStorage.removeItem('telegram_user_id');
localStorage.removeItem('telegram_user_info');
localStorage.removeItem('telegram_session_id');
sessionStorage.clear();

// 2. Generate a fresh user ID for authentication
const freshUserId = `user_${Date.now()}`;
localStorage.setItem('telegram_user_id', freshUserId);

console.log('✅ AUTHENTICATION RESET COMPLETE!');
console.log('🆔 Fresh user ID for authentication:', freshUserId);
console.log('');
console.log('📱 NOW FOLLOW THESE STEPS:');
console.log('1. Click "Connect Telegram" button');
console.log('2. Enter phone: +917845268852 (JayZ number)');
console.log('3. Enter OTP from Telegram');
console.log('4. Backend will store client with this user ID in MongoDB');
console.log('5. Frontend will use the SAME user ID for scanning');
console.log('');
console.log('🔗 This ensures MongoDB and frontend are synchronized!');

// 3. Reload page to reset React state
setTimeout(() => {
  console.log('🔄 Reloading page to reset React state...');
  window.location.reload();
}, 3000); 