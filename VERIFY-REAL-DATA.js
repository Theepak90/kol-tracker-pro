// VERIFY REAL DATA DISPLAY
// Run this in browser console to check if real data is working

console.log('🔍 VERIFYING REAL DATA DISPLAY');
console.log('===============================');

// Test the current API endpoint
const userId = localStorage.getItem('telegram_user_id');
if (!userId) {
  console.log('❌ No user ID found. Please authenticate first.');
} else {
  console.log('✅ Testing with user ID:', userId);
  
  // Test API call
  fetch(`http://localhost:8000/scan/btcgroupindia?user_id=${userId}`)
    .then(response => response.json())
    .then(data => {
      console.log('📊 REAL API DATA:');
      console.log('  Title:', data.title);
      console.log('  Username:', data.username);
      console.log('  Description:', data.description || '(empty)');
      console.log('  Member Count:', data.member_count || '(null - private)');
      console.log('  Message Count:', data.message_count);
      console.log('  Recent Messages:', data.recent_activity?.length || 0);
      
      if (data.recent_activity?.length > 0) {
        console.log('✅ REAL MESSAGE SAMPLES:');
        data.recent_activity.slice(0, 3).forEach((msg, i) => {
          console.log(`  ${i+1}. ID ${msg.id}: "${msg.text.substring(0, 50)}..."`);
        });
      }
      
      console.log('');
      console.log('🎯 WHAT YOU SHOULD SEE ON FRONTEND:');
      console.log('  - Total Members: "Private" (not fake numbers)');
      console.log('  - Active Members: "Unknown" (not fake numbers)');
      console.log('  - Bot Count: "Unknown" (not fake numbers)');
      console.log('  - KOL Count: "None Found" (not fake numbers)');
      console.log('  - Description: "Private channel - description not available"');
      console.log('  - Real-Time Channel Activity section with actual messages');
    })
    .catch(error => {
      console.log('❌ API Error:', error);
    });
} 