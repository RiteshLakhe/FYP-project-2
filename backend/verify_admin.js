const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const adminModel = require('./model/admin.model');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to database');
    
    // Check all admins in database
    const allAdmins = await adminModel.find({});
    console.log(`\nTotal admins in database: ${allAdmins.length}`);
    allAdmins.forEach((admin, index) => {
      console.log(`  ${index + 1}. Email: ${admin.email}, ID: ${admin._id}`);
    });
    
    // Check for the expected admin
    const expectedEmail = process.env.ADMIN_EMAIL;
    const expectedPassword = process.env.ADMIN_PASSWORD;
    
    console.log(`\n.env values:`);
    console.log(`  ADMIN_EMAIL: ${expectedEmail}`);
    console.log(`  ADMIN_PASSWORD: ${expectedPassword}`);
    
    const admin = await adminModel.findOne({ email: expectedEmail });
    if (admin) {
      console.log(`\n✓ Admin with email "${expectedEmail}" found`);
      const isPasswordValid = await bcrypt.compare(expectedPassword, admin.password);
      console.log(`✓ Password is ${isPasswordValid ? 'VALID' : 'INVALID'}`);
    } else {
      console.log(`\n✗ Admin with email "${expectedEmail}" NOT found in database`);
    }
    
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

verify();
