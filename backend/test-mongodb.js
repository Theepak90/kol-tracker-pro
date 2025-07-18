const mongoose = require('mongoose');

// Try different cluster URL formats
const clusterUrls = [
  'mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority',
  'mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.zqxyz.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority',
  'mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.abcde.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority',
  'mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.mongodb.net/kol-tracker-pro',
  'mongodb://theepakkumar187:XP3YPWryQfSGDeKM@cluster0-shard-00-00.mongodb.net:27017,cluster0-shard-00-01.mongodb.net:27017,cluster0-shard-00-02.mongodb.net:27017/kol-tracker-pro?ssl=true&replicaSet=atlas-default&authSource=admin&retryWrites=true&w=majority'
];

async function testConnections() {
  for (let i = 0; i < clusterUrls.length; i++) {
    const uri = clusterUrls[i];
    console.log(`\n🔄 Testing connection ${i + 1}/${clusterUrls.length}...`);
    console.log('URI:', uri.replace(/:[^:@]*@/, ':****@'));
    
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      console.log('✅ MongoDB connection successful!');
      console.log('Database:', mongoose.connection.db.databaseName);
      console.log('Host:', mongoose.connection.host);
      
      // Test a simple operation
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📁 Available collections:', collections.map(c => c.name));
      
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
      console.log('✅ FOUND WORKING CONNECTION!');
      break;
      
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      try {
        await mongoose.disconnect();
      } catch (disconnectError) {
        // Ignore disconnect errors
      }
    }
  }
}

testConnections(); 