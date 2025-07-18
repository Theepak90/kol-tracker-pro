const mongoose = require('mongoose');

// Test MongoDB connection with your actual credentials
async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    
    // Your actual MongoDB URI
    const MONGODB_URI = 'mongodb+srv://theepakkumar187:XP3YPWryQfSGDeKM@cluster0.0wgm1.mongodb.net/kol-tracker-pro?retryWrites=true&w=majority';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // Test basic operations
    const testSchema = new mongoose.Schema({
      name: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    // Create a test document
    const testDoc = new TestModel({ name: 'Connection Test' });
    await testDoc.save();
    console.log('✅ Test document created successfully!');
    
    // Read the test document
    const foundDoc = await TestModel.findOne({ name: 'Connection Test' });
    console.log('✅ Test document found:', foundDoc.name);
    
    // Clean up test document
    await TestModel.deleteOne({ name: 'Connection Test' });
    console.log('✅ Test document cleaned up!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ MongoDB connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection(); 