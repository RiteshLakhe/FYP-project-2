
const mongoose = require('mongoose');
require('dotenv').config();
const adminModel = require('./model/admin.model');

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    await adminModel.deleteMany({ email: 'admin@rentease.com' });
    console.log('Admin deleted. Restart server to recreate.');
    await mongoose.disconnect();
  } catch (e) {
    console.error(e.message);
  }
}

resetAdmin();

