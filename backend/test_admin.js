
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const adminModel = require('./model/admin.model');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const admin = await adminModel.findOne({ email: 'admin@rentease.com' });
    if (admin) {
      console.log('Admin exists');
      const valid = await bcrypt.compare('Admin@123456', admin.password);
      console.log('Password valid:', valid);
    } else {
      console.log('Admin not found');
    }
    await mongoose.disconnect();
  } catch (e) {
    console.error(e.message);
  }
}

test();

