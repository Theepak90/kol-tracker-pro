// 🚨 COPY AND PASTE THIS INTO BROWSER CONSOLE (F12) 🚨
// This will clear ALL storage and force fresh authentication

console.log('🧹 NUCLEAR CLEAR - Removing ALL storage...');

// Clear localStorage
localStorage.clear();

// Clear sessionStorage  
sessionStorage.clear();

// Clear any IndexedDB
try {
  indexedDB.deleteDatabase('kol-tracker');
  indexedDB.deleteDatabase('kol-tracker-pro');
} catch (e) {
  console.log('No IndexedDB to clear');
}

// Clear cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('💥 EVERYTHING CLEARED!');
console.log('🔄 Reloading page for fresh start...');

// Force hard reload
setTimeout(() => {
  window.location.reload(true);
}, 1000); 