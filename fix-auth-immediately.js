// IMMEDIATE FIX: Clear all authentication data and reload
console.log('🧹 Clearing ALL authentication data...');

// Clear all localStorage items
localStorage.removeItem('telegram_user_id');
localStorage.removeItem('telegram_user_info');
localStorage.removeItem('telegram_session_id');

// Clear any other potential auth items
Object.keys(localStorage).forEach(key => {
  if (key.includes('telegram') || key.includes('user') || key.includes('auth')) {
    localStorage.removeItem(key);
    console.log('🗑️ Removed:', key);
  }
});

console.log('✅ All authentication data cleared!');
console.log('🔄 Refreshing page for fresh start...');

// Force page reload for fresh state
setTimeout(() => {
  window.location.reload();
}, 1000); 