// FORCE CLEAR AND FRESH AUTHENTICATION
// Run this in browser console to completely reset auth state

console.log('🔄 FORCING COMPLETE AUTHENTICATION RESET...');

// 1. Clear ALL localStorage data
console.log('🧹 Clearing ALL localStorage...');
localStorage.clear();

// 2. Clear sessionStorage too
console.log('🧹 Clearing sessionStorage...');
sessionStorage.clear();

// 3. Generate fresh user ID
const freshUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
localStorage.setItem('telegram_user_id', freshUserId);

console.log('✅ COMPLETE RESET DONE!');
console.log('🆔 New user ID:', freshUserId);
console.log('📱 Now click "Connect Telegram" to start fresh authentication');

// 4. Reload the page to ensure clean state
console.log('🔄 Reloading page in 2 seconds...');
setTimeout(() => {
  window.location.reload();
}, 2000); 