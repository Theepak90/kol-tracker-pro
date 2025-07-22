// 🔥 FORCE AUTHENTICATION SYNC 🔥
// Run this in browser console (F12) if scanning still fails

console.log('🔥 FORCING AUTHENTICATION SYNCHRONIZATION...');

// Get the latest authenticated user ID from backend
fetch('http://localhost:8000/health')
  .then(() => {
    // Force clear old user ID
    localStorage.removeItem('telegram_user_id');
    
    // Generate new user ID that will be used for BOTH auth and scanning
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('telegram_user_id', newUserId);
    
    console.log('🆔 NEW USER ID CREATED:', newUserId);
    console.log('📋 RE-AUTHENTICATE NOW:');
    console.log('1. Click "Connect Telegram"');
    console.log('2. Enter phone number');
    console.log('3. Enter OTP');
    console.log('4. Try scanning - WILL USE SAME ID!');
    
    // Force page refresh to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  })
  .catch(e => {
    console.error('Service not running:', e);
    console.log('❌ Make sure backend is running on localhost:8000');
  }); 